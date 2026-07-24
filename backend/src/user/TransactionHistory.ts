import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/Database';

let app: FastifyInstance;

export class TransactionHistoryController {
  static async init(fastify: FastifyInstance) {
    app = fastify;
    fastify.post('/transactionHistory', getTransactionHistory);
  }
}

interface HistoryQuery {
  limit?: number;
  offset?: number;
  source?: 'game' | 'payment';
}

async function getTransactionHistory(
  req: FastifyRequest<{ Body: HistoryQuery }>,
  res: FastifyReply,
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.code(401).send({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  let decoded: any;
  try {
    decoded = app.jwt.verify(token);
  } catch {
    return res.code(401).send({ message: 'Invalid token' });
  }

  const userId = decoded.id;
  const limit = Math.min(req.body.limit || 10, 100);
  const offset = req.body.offset || 0;
  const source = req.body.source;

  let dataQuery: string;
  let countQuery: string;

  if (source === 'game') {
    dataQuery = `
      SELECT
        b.id AS id,
        'game' AS source,
        b.event AS event,
        b.turnover AS turnover,
        b.payout AS payout,
        b.netWin AS amount,
        b.previousBalance AS previousBalance,
        b.newBalance AS newBalance,
        g.name AS gameName,
        g.provider AS provider,
        b.createdAt AS date
      FROM Bets b
      LEFT JOIN Games g ON g.id = b.gameId
      WHERE b.userId = :userId AND b.status = 'COMPLETE'
      ORDER BY b.createdAt DESC
      LIMIT :limit OFFSET :offset
    `;
    countQuery = `SELECT COUNT(*) AS total FROM Bets WHERE userId = :userId AND status = 'COMPLETE'`;
  } else if (source === 'payment') {
    dataQuery = `
      SELECT
        t.id AS id,
        'payment' AS source,
        t.event AS event,
        NULL AS turnover,
        NULL AS payout,
        t.amount AS amount,
        t.previousBalance AS previousBalance,
        t.newBalance AS newBalance,
        t.channel AS gameName,
        NULL AS provider,
        t.status AS status,
        t.createdAt AS date
      FROM Transactions t
      WHERE t.userId = :userId
      ORDER BY t.createdAt DESC
      LIMIT :limit OFFSET :offset
    `;
    countQuery = `SELECT COUNT(*) AS total FROM Transactions WHERE userId = :userId`;
  } else {
    dataQuery = `
      SELECT * FROM (
        SELECT
          b.id AS id, 'game' AS source, b.event AS event,
          b.turnover AS turnover, b.payout AS payout, b.netWin AS amount,
          b.previousBalance AS previousBalance, b.newBalance AS newBalance,
          g.name AS gameName, g.provider AS provider, b.createdAt AS date
        FROM Bets b LEFT JOIN Games g ON g.id = b.gameId
        WHERE b.userId = :userId AND b.status = 'COMPLETE'
        UNION ALL
        SELECT
          t.id AS id, 'payment' AS source, t.event AS event,
          NULL AS turnover, NULL AS payout, t.amount AS amount,
          t.previousBalance AS previousBalance, t.newBalance AS newBalance,
          t.channel AS gameName, NULL AS provider, t.status AS status, t.createdAt AS date
        FROM Transactions t WHERE t.userId = :userId
      ) AS combined ORDER BY date DESC LIMIT :limit OFFSET :offset
    `;
    countQuery = `
      SELECT
        (SELECT COUNT(*) FROM Bets WHERE userId = :userId AND status = 'COMPLETE') +
        (SELECT COUNT(*) FROM Transactions WHERE userId = :userId)
      AS total
    `;
  }

  const rows = await sequelize.query(dataQuery, {
    replacements: { userId, limit, offset },
    type: QueryTypes.SELECT,
  });

  const count: any = await sequelize.query(countQuery, {
    replacements: { userId },
    type: QueryTypes.SELECT,
  });

  return res.send({
    data: rows,
    total: count[0]?.total || 0,
    limit,
    offset,
  });
}
