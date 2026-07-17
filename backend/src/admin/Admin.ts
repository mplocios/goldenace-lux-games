import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Op } from "sequelize";
import { sequelize } from "../../database/Database";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import Game from "../../models/Game";
import Bets from "../../models/Bets";
import Transaction from "../../models/Transaction";
import BetTransaction from "../../models/BetTransaction";
import WebSocketService from "../services/WebSocketService";

Bets.belongsTo(Game, { foreignKey: "gameId", as: "game" });

let app: FastifyInstance;

/**
 * Verify JWT and check that the user is an admin.
 * Returns the decoded token payload on success, or sends 403 and returns null.
 */
async function requireAdmin(req: FastifyRequest, res: FastifyReply): Promise<any | null> {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.code(401).send({ error: "auth_token_missing", status: 401, message: "Authorization token missing" });
      return null;
    }
    const token = authHeader.split(" ")[1];
    if (!token || token === "undefined") {
      res.code(401).send({ error: "auth_token_invalid", status: 401, message: "Invalid or expired token" });
      return null;
    }

    const decoded: any = app.jwt.verify(token);

    if (decoded.type !== "admin") {
      res.code(403).send({ error: "auth_unauthorized", status: 403, message: "Unauthorized access" });
      return null;
    }

    return decoded;
  } catch (e) {
    res.code(401).send({ error: "auth_token_expired", status: 401, message: "Token has expired" });
    return null;
  }
}

export class AdminApi {
  static async register(fastify: FastifyInstance) {
    app = fastify;

    fastify.get("/dashboard", dashboard);
    fastify.get("/players", listPlayers);
    fastify.get("/players/:id", getPlayerDetail);
    fastify.post("/players/:id/credits", adjustCredits);
    fastify.post("/players/:id/ban", banPlayer);
    fastify.get("/games", listGames);
    fastify.post("/games/:id/toggle", toggleGame);
    fastify.get("/transactions", listTransactions);
    fastify.get("/chart/revenue", chartRevenue);
    fastify.get("/chart/players", chartPlayers);
  }
}

// ─── 1. Dashboard Stats ─────────────────────────────────────────────────────

async function dashboard(req: FastifyRequest, res: FastifyReply) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalPlayers,
    creditsSums,
    betsToday,
    betsTodayAgg,
    depositsToday,
    withdrawalsToday,
    newPlayersToday,
    activePlayersToday,
  ] = await Promise.all([
    // Total players
    User.count({ where: { type: "player" } }),

    // Total credits & withdrawable
    Wallet.findOne({
      attributes: [
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("credits")), 0), "totalCredits"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("withdrawable")), 0), "totalWithdrawable"],
      ],
      raw: true,
    }),

    // Total bets today (count)
    Bets.count({ where: { createdAt: { [Op.gte]: todayStart } } }),

    // Bets aggregation today (turnover, payout)
    Bets.findOne({
      attributes: [
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("turnover")), 0), "totalTurnover"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("payout")), 0), "totalPayout"],
      ],
      where: { createdAt: { [Op.gte]: todayStart } },
      raw: true,
    }),

    // Total deposits (count + sum)
    Transaction.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "totalAmount"],
      ],
      where: { event: "deposit", status: "success" },
      raw: true,
    }),

    // Total withdrawals (count + sum)
    Transaction.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "totalAmount"],
      ],
      where: { event: "withdraw", status: "success" },
      raw: true,
    }),

    // New players today
    User.count({ where: { type: "player", createdAt: { [Op.gte]: todayStart } } }),

    // Active players today (distinct userId from Bets)
    Bets.count({
      where: { createdAt: { [Op.gte]: todayStart } },
      distinct: true,
      col: "userId",
    }),
  ]);

  const creds: any = creditsSums || {};
  const betsAgg: any = betsTodayAgg || {};
  const deps: any = depositsToday || {};
  const withs: any = withdrawalsToday || {};

  const totalTurnover = parseFloat(betsAgg.totalTurnover) || 0;
  const totalPayout = parseFloat(betsAgg.totalPayout) || 0;

  return res.code(200).send({
    totalPlayers,
    totalCredits: parseFloat(creds.totalCredits) || 0,
    totalWithdrawable: parseFloat(creds.totalWithdrawable) || 0,
    betsToday,
    turnoverToday: totalTurnover,
    payoutToday: totalPayout,
    netWinToday: totalTurnover - totalPayout,
    totalDeposits: parseInt(deps.count) || 0,
    totalDepositAmount: parseFloat(deps.totalAmount) || 0,
    totalWithdrawals: parseInt(withs.count) || 0,
    totalWithdrawalAmount: parseFloat(withs.totalAmount) || 0,
    newPlayersToday,
    activePlayersToday,
  });
}

// ─── 2. List Players ────────────────────────────────────────────────────────

interface PlayersQuery {
  limit?: string;
  offset?: string;
  search?: string;
  status?: string;
}

async function listPlayers(req: FastifyRequest<{ Querystring: PlayersQuery }>, res: FastifyReply) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const where: any = { type: "player" };

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or as any] = [
      { mobile: { [Op.like]: `%${search}%` } },
      { playerId: { [Op.like]: `%${search}%` } },
      { nickname: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: Wallet, as: "wallet" }],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const data = rows.map((u: any) => ({
    id: u.id,
    playerId: u.playerId,
    nickname: u.nickname,
    mobile: u.mobile,
    type: u.type,
    balance: u.wallet ? parseFloat(u.wallet.credits) || 0 : 0,
    withdrawable: u.wallet ? parseFloat(u.wallet.withdrawable) || 0 : 0,
    status: u.status || "active",
    bannedUntil: u.bannedUntil,
    createdAt: u.createdAt,
  }));

  return res.code(200).send({ data, total: count });
}

// ─── 2b. Player Detail ─────────────────────────────────────────────────────

interface PlayerDetailQuery {
  txLimit?: string;
  txOffset?: string;
  betLimit?: string;
  betOffset?: string;
}

async function getPlayerDetail(
  req: FastifyRequest<{ Params: { id: string }; Querystring: PlayerDetailQuery }>,
  res: FastifyReply
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.id);
  const txLimit = parseInt(req.query.txLimit as string) || 20;
  const txOffset = parseInt(req.query.txOffset as string) || 0;
  const betLimit = parseInt(req.query.betLimit as string) || 20;
  const betOffset = parseInt(req.query.betOffset as string) || 0;

  const user = await User.findByPk(userId, {
    include: [{ model: Wallet, as: "wallet" }],
  });
  if (!user) {
    return res.code(404).send({ error: "user_not_found", status: 404, message: "User not found" });
  }

  const u: any = user;

  const [
    stats,
    txResult,
    betResult,
  ] = await Promise.all([
    // Summary stats
    (async () => {
      const [depositAgg, withdrawAgg, betAgg, lastLogin]: any[] = await Promise.all([
        Transaction.findOne({
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "total"],
          ],
          where: { userId, event: "deposit", status: "success" },
          raw: true,
        }),
        Transaction.findOne({
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "total"],
          ],
          where: { userId, event: "withdraw", status: "success" },
          raw: true,
        }),
        Bets.findOne({
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("id")), "totalBets"],
            [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("turnover")), 0), "totalTurnover"],
            [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("payout")), 0), "totalPayout"],
            [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("netWin")), 0), "totalNetWin"],
          ],
          where: { userId },
          raw: true,
        }),
        Bets.findOne({
          attributes: [[sequelize.fn("MAX", sequelize.col("createdAt")), "lastActivity"]],
          where: { userId },
          raw: true,
        }),
      ]);
      return {
        totalDeposits: parseInt(depositAgg?.count) || 0,
        totalDepositAmount: parseFloat(depositAgg?.total) || 0,
        totalWithdrawals: parseInt(withdrawAgg?.count) || 0,
        totalWithdrawalAmount: parseFloat(withdrawAgg?.total) || 0,
        totalBets: parseInt(betAgg?.totalBets) || 0,
        totalTurnover: parseFloat(betAgg?.totalTurnover) || 0,
        totalPayout: parseFloat(betAgg?.totalPayout) || 0,
        totalNetWin: parseFloat(betAgg?.totalNetWin) || 0,
        lastActivity: lastLogin?.lastActivity || null,
      };
    })(),

    // Transactions (paginated)
    Transaction.findAndCountAll({
      where: { userId },
      limit: txLimit,
      offset: txOffset,
      order: [["createdAt", "DESC"]],
    }),

    // Bets (paginated) with game info
    Bets.findAndCountAll({
      where: { userId },
      include: [{ model: Game, as: "game", attributes: ["id", "name", "type", "provider", "thumbnail"] }],
      limit: betLimit,
      offset: betOffset,
      order: [["createdAt", "DESC"]],
    }),
  ]);

  return res.code(200).send({
    player: {
      id: u.id,
      playerId: u.playerId,
      nickname: u.nickname,
      mobile: u.mobile,
      type: u.type,
      status: u.status || "active",
      bannedUntil: u.bannedUntil,
      balance: u.wallet ? parseFloat(u.wallet.credits) || 0 : 0,
      withdrawable: u.wallet ? parseFloat(u.wallet.withdrawable) || 0 : 0,
      createdAt: u.createdAt,
    },
    stats,
    transactions: { data: txResult.rows, total: txResult.count },
    bets: { data: betResult.rows, total: betResult.count },
  });
}

// ─── 3. Grant / Deduct Credits ──────────────────────────────────────────────

interface CreditsBody {
  amount: number;
  action: "grant" | "deduct";
  remarks?: string;
}

async function adjustCredits(
  req: FastifyRequest<{ Params: { id: string }; Body: CreditsBody }>,
  res: FastifyReply
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.id);
  const { amount, action, remarks } = req.body;

  if (!amount || amount <= 0) {
    return res.code(400).send({ error: "invalid_amount", status: 400, message: "Amount must be greater than 0" });
  }

  if (!["grant", "deduct"].includes(action)) {
    return res.code(400).send({ error: "invalid_parameter", status: 400, message: "Action must be 'grant' or 'deduct'" });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.code(404).send({ error: "user_not_found", status: 404, message: "User not found" });
  }

  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    return res.code(404).send({ error: "wallet_not_found", status: 404, message: "Wallet not found" });
  }

  const previousCredits = parseFloat(wallet.credits) || 0;
  const previousWithdrawable = parseFloat(wallet.withdrawable) || 0;

  let newCredits: number;
  let newWithdrawable: number;
  let event: string;

  if (action === "grant") {
    // Admin grants go to credits only (playable, not withdrawable)
    newCredits = previousCredits + amount;
    newWithdrawable = previousWithdrawable;
    event = "admin_grant";
  } else {
    // Deduct from credits; also reduce withdrawable if needed
    if (previousCredits < amount) {
      return res.code(400).send({ error: "insufficient_balance", status: 400, message: "Insufficient balance to deduct" });
    }
    newCredits = previousCredits - amount;
    // If withdrawable exceeds new credits, cap it
    newWithdrawable = Math.min(previousWithdrawable, newCredits);
    event = "admin_deduct";
  }

  await wallet.update({ credits: newCredits, withdrawable: newWithdrawable });

  // Create Transaction record
  await Transaction.create({
    userId,
    amount,
    channel: "ADMIN",
    event,
    status: "success",
    previousBalance: previousCredits,
    newBalance: newCredits,
    remarks: remarks || `Admin ${action} by ${admin.id}`,
  });

  // Send WebSocket credit update to the player
  WebSocketService.sendToClient(String(userId), {
    type: "CreditUpdate",
    balance: newCredits,
    withdrawable: newWithdrawable,
  });

  return res.code(200).send({
    balance: newCredits,
    withdrawable: newWithdrawable,
  });
}

// ─── 4. Ban / Suspend / Unban ───────────────────────────────────────────────

interface BanBody {
  action: "ban" | "suspend" | "unban";
  duration?: number;
}

async function banPlayer(
  req: FastifyRequest<{ Params: { id: string }; Body: BanBody }>,
  res: FastifyReply
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.id);
  const { action, duration } = req.body;

  if (!["ban", "suspend", "unban"].includes(action)) {
    return res.code(400).send({ error: "invalid_parameter", status: 400, message: "Action must be 'ban', 'suspend', or 'unban'" });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.code(404).send({ error: "user_not_found", status: 404, message: "User not found" });
  }

  let status: string;
  let bannedUntil: Date | null = null;

  if (action === "ban") {
    status = "banned";
    bannedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
  } else if (action === "suspend") {
    status = "suspended";
    bannedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
  } else {
    // unban
    status = "active";
    bannedUntil = null;
  }

  await user.update({ status, bannedUntil });

  return res.code(200).send({
    id: user.id,
    playerId: user.playerId,
    nickname: user.nickname,
    mobile: user.mobile,
    status,
    bannedUntil,
  });
}

// ─── 5. List Games ──────────────────────────────────────────────────────────

interface GamesQuery {
  limit?: string;
  offset?: string;
  search?: string;
  provider?: string;
  type?: string;
  is_active?: string;
}

async function listGames(req: FastifyRequest<{ Querystring: GamesQuery }>, res: FastifyReply) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const search = req.query.search as string | undefined;
  const provider = req.query.provider as string | undefined;
  const type = req.query.type as string | undefined;
  const isActive = req.query.is_active as string | undefined;

  const where: any = {};

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (provider) {
    where.provider = provider;
  }
  if (type) {
    where.type = type;
  }
  if (isActive !== undefined && isActive !== "") {
    where.is_active = isActive === "true";
  }

  const { count, rows } = await Game.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return res.code(200).send({ data: rows, total: count });
}

// ─── 6. Toggle Game Active ──────────────────────────────────────────────────

interface ToggleBody {
  is_active: boolean;
}

async function toggleGame(
  req: FastifyRequest<{ Params: { id: string }; Body: ToggleBody }>,
  res: FastifyReply
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const gameId = parseInt(req.params.id);
  const { is_active } = req.body;

  const game = await Game.findByPk(gameId);
  if (!game) {
    return res.code(404).send({ error: "game_not_found", status: 404, message: "Game not found" });
  }

  await game.update({ is_active });

  return res.code(200).send(game);
}

// ─── 7. List Transactions ───────────────────────────────────────────────────

interface TransactionsQuery {
  limit?: string;
  offset?: string;
  event?: string;
  status?: string;
}

async function listTransactions(
  req: FastifyRequest<{ Querystring: TransactionsQuery }>,
  res: FastifyReply
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const event = req.query.event as string | undefined;
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (event) where.event = event;
  if (status) where.status = status;

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "playerId", "nickname", "mobile", "type"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return res.code(200).send({ data: rows, total: count });
}

// ─── 8. Revenue Chart (last 14 days) ────────────────────────────────────────

async function chartRevenue(req: FastifyRequest, res: FastifyReply) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 13);
  startDate.setHours(0, 0, 0, 0);

  const [betsData]: any = await sequelize.query(
    `SELECT
       DATE(createdAt) as date,
       COALESCE(SUM(turnover), 0) as totalTurnover,
       COALESCE(SUM(payout), 0) as totalPayout,
       COALESCE(SUM(turnover), 0) - COALESCE(SUM(payout), 0) as netWin
     FROM Bets
     WHERE createdAt >= :startDate
     GROUP BY DATE(createdAt)
     ORDER BY date ASC`,
    { replacements: { startDate } }
  );

  const [txnData]: any = await sequelize.query(
    `SELECT
       DATE(createdAt) as date,
       event,
       COALESCE(SUM(amount), 0) as totalAmount
     FROM Transactions
     WHERE createdAt >= :startDate
       AND status = 'success'
       AND event IN ('deposit', 'withdraw')
     GROUP BY DATE(createdAt), event
     ORDER BY date ASC`,
    { replacements: { startDate } }
  );

  // Build a map of 14 days
  const result: any[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const betRow = betsData.find((r: any) => {
      const rd = new Date(r.date).toISOString().split("T")[0];
      return rd === dateStr;
    });

    const depositRow = txnData.find((r: any) => {
      const rd = new Date(r.date).toISOString().split("T")[0];
      return rd === dateStr && r.event === "deposit";
    });

    const withdrawRow = txnData.find((r: any) => {
      const rd = new Date(r.date).toISOString().split("T")[0];
      return rd === dateStr && r.event === "withdraw";
    });

    result.push({
      date: dateStr,
      totalTurnover: betRow ? parseFloat(betRow.totalTurnover) : 0,
      totalPayout: betRow ? parseFloat(betRow.totalPayout) : 0,
      netWin: betRow ? parseFloat(betRow.netWin) : 0,
      depositAmount: depositRow ? parseFloat(depositRow.totalAmount) : 0,
      withdrawAmount: withdrawRow ? parseFloat(withdrawRow.totalAmount) : 0,
    });
  }

  return res.code(200).send(result);
}

// ─── 9. Player Chart (last 14 days) ─────────────────────────────────────────

async function chartPlayers(req: FastifyRequest, res: FastifyReply) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 13);
  startDate.setHours(0, 0, 0, 0);

  const [newPlayersData]: any = await sequelize.query(
    `SELECT
       DATE(createdAt) as date,
       COUNT(*) as newPlayers
     FROM users
     WHERE type = 'player'
       AND createdAt >= :startDate
     GROUP BY DATE(createdAt)
     ORDER BY date ASC`,
    { replacements: { startDate } }
  );

  const [activePlayersData]: any = await sequelize.query(
    `SELECT
       DATE(createdAt) as date,
       COUNT(DISTINCT userId) as activePlayers
     FROM Bets
     WHERE createdAt >= :startDate
     GROUP BY DATE(createdAt)
     ORDER BY date ASC`,
    { replacements: { startDate } }
  );

  const result: any[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const newRow = newPlayersData.find((r: any) => {
      const rd = new Date(r.date).toISOString().split("T")[0];
      return rd === dateStr;
    });

    const activeRow = activePlayersData.find((r: any) => {
      const rd = new Date(r.date).toISOString().split("T")[0];
      return rd === dateStr;
    });

    result.push({
      date: dateStr,
      newPlayers: newRow ? parseInt(newRow.newPlayers) : 0,
      activePlayers: activeRow ? parseInt(activeRow.activePlayers) : 0,
    });
  }

  return res.code(200).send(result);
}
