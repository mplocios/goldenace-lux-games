const API_URL = import.meta.env.VITE_API_URL ?? "";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function get<T>(token: string, path: string, params?: Record<string, any>): Promise<T> {
  const query = params ? "?" + new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])
  ).toString() : "";
  const res = await fetch(`${API_URL}/api/admin${path}${query}`, { headers: authHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

async function post<T>(token: string, path: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface DashboardStats {
  totalPlayers: number;
  totalCredits: number;
  totalWithdrawable: number;
  betsToday: number;
  turnoverToday: number;
  payoutToday: number;
  netWinToday: number;
  totalDeposits: number;
  totalDepositAmount: number;
  totalWithdrawals: number;
  totalWithdrawalAmount: number;
  newPlayersToday: number;
  activePlayersToday: number;
}

export interface PlayerRow {
  id: number;
  playerId: string;
  nickname: string;
  mobile: string;
  type: string;
  balance: number;
  withdrawable: number;
  status: string;
  bannedUntil: string | null;
  createdAt: string;
}

export interface GameRow {
  id: number;
  uuid: string;
  name: string;
  image: string | null;
  thumbnail: string | null;
  type: string;
  provider: string;
  is_active: boolean;
  rtp: number | null;
}

export interface TxRow {
  id: number;
  userId: number;
  playerName: string;
  playerId: string;
  amount: number;
  channel: string;
  event: string;
  status: string;
  previousBalance: number;
  newBalance: number;
  remarks: string | null;
  createdAt: string;
}

export interface PlayerDetail {
  player: PlayerRow;
  stats: {
    totalDeposits: number;
    totalDepositAmount: number;
    totalWithdrawals: number;
    totalWithdrawalAmount: number;
    totalBets: number;
    totalTurnover: number;
    totalPayout: number;
    totalNetWin: number;
    lastActivity: string | null;
  };
  transactions: { data: TxRow[]; total: number };
  bets: { data: BetRow[]; total: number };
}

export interface BetRow {
  id: number;
  gameId: number;
  userId: number;
  status: string;
  turnover: number;
  payout: number;
  netWin: number;
  event: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
  game?: {
    id: number;
    name: string;
    type: string;
    provider: string;
    thumbnail: string | null;
  };
}

export interface ChartPoint {
  date: string;
  totalTurnover: number;
  totalPayout: number;
  netWin: number;
  depositAmount: number;
  withdrawAmount: number;
}

export interface PlayerChartPoint {
  date: string;
  newPlayers: number;
  activePlayers: number;
}

export const adminApi = {
  dashboard: (token: string) => get<DashboardStats>(token, "/dashboard"),

  players: (token: string, p?: { limit?: number; offset?: number; search?: string; status?: string }) =>
    get<{ data: PlayerRow[]; total: number }>(token, "/players", p),

  playerDetail: (token: string, id: number, p?: { txLimit?: number; txOffset?: number; betLimit?: number; betOffset?: number }) =>
    get<PlayerDetail>(token, `/players/${id}`, p),

  grantCredits: (token: string, id: number, body: { amount: number; action: "grant" | "deduct"; remarks?: string }) =>
    post<{ balance: number; withdrawable: number }>(token, `/players/${id}/credits`, body),

  banPlayer: (token: string, id: number, body: { action: "ban" | "suspend" | "unban"; duration?: number }) =>
    post<PlayerRow>(token, `/players/${id}/ban`, body),

  games: (token: string, p?: { limit?: number; offset?: number; search?: string; provider?: string; type?: string; is_active?: string }) =>
    get<{ data: GameRow[]; total: number }>(token, "/games", p),

  toggleGame: (token: string, id: number, is_active: boolean) =>
    post<GameRow>(token, `/games/${id}/toggle`, { is_active }),

  transactions: (token: string, p?: { limit?: number; offset?: number; event?: string; status?: string }) =>
    get<{ data: TxRow[]; total: number }>(token, "/transactions", p),

  revenueChart: (token: string) => get<ChartPoint[]>(token, "/chart/revenue"),

  playerChart: (token: string) => get<PlayerChartPoint[]>(token, "/chart/players"),
};
