const API_URL = import.meta.env.VITE_API_URL ?? "";

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    playerId: string;
    nickname: string;
    user_type: string;
    mobile_number: string;
    type: string;
    balance: number;
    withdrawable: number;
    hasDeposited: boolean;
  };
}

export async function apiLogin(mobile: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(err.message || "Login failed");
  }

  return res.json();
}

export async function apiUpdateNickname(token: string, nickname: string): Promise<{ message: string; nickname: string }> {
  const res = await fetch(`${API_URL}/api/users/nickname`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nickname }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Update failed" }));
    throw new Error(err.message || "Update failed");
  }

  return res.json();
}

export async function apiRegister(mobile: string, password: string, name: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password, name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message || "Registration failed");
  }

  return res.json();
}

export interface DbGame {
  id: number;
  uuid: string;
  name: string;
  image: string | null;
  type: string;
  provider: string;
  technology: string;
  has_lobby: boolean;
  is_mobile: boolean;
  has_freespins: boolean;
  has_tables: boolean;
  label: string | null;
  rtp: number | null;
  volatility: string | null;
  source: string | null;
  thumbnail: string | null;
  is_active: boolean;
}

export async function apiGetGames(params: {
  type?: string;
  provider?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
  q?: string;
  uuids?: string;
} = {}): Promise<DbGame[]> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.provider) query.set("provider", params.provider);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.is_active !== undefined) query.set("is_active", String(params.is_active));
  if (params.q) query.set("q", params.q);
  if (params.uuids) query.set("uuids", params.uuids);

  const res = await fetch(`${API_URL}/api/games?${query.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

export async function apiCountGames(params: {
  type?: string;
  provider?: string;
} = {}): Promise<number> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.provider) query.set("provider", params.provider);

  const res = await fetch(`${API_URL}/api/coutGames?${query.toString()}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.totalCount || 0;
}

export async function apiCheckLogin(token: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/users/checklogin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Session expired");
  }

  return res.json();
}

export async function apiFetchFavorites(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/users/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function apiAddFavorite(token: string, gameUuid: string): Promise<void> {
  await fetch(`${API_URL}/api/users/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameUuid }),
  });
}

export async function apiRemoveFavorite(token: string, gameUuid: string): Promise<void> {
  await fetch(`${API_URL}/api/users/favorites/${encodeURIComponent(gameUuid)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiCashIn(
  token: string,
  opts: { price: number; coins: number; paymentType: string },
): Promise<{ paymentUrl: string; transactionId: number; status: string }> {
  const res = await fetch(`${API_URL}/api/payments/cashin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Deposit failed" }));
    throw new Error(err.message || err.error || "Deposit failed");
  }
  return res.json();
}

export async function apiCashOut(
  token: string,
  opts: { amount: number; bankCode: string; accountNo: string; firstName: string; middleName: string; lastName: string },
): Promise<{ message: string; transactionId: number; status: string }> {
  const res = await fetch(`${API_URL}/api/payments/cashout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Withdraw failed" }));
    throw new Error(err.message || err.error || "Withdraw failed");
  }
  return res.json();
}

export async function apiDeposit(token: string, amount: number): Promise<{ balance: number; withdrawable: number }> {
  const res = await fetch(`${API_URL}/api/users/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Deposit failed" }));
    throw new Error(err.message || "Deposit failed");
  }
  return res.json();
}

export async function apiWithdraw(token: string, amount: number): Promise<{ balance: number; withdrawable: number }> {
  const res = await fetch(`${API_URL}/api/users/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Withdraw failed" }));
    throw new Error(err.message || "Withdraw failed");
  }
  return res.json();
}

export interface TransactionRecord {
  id: number;
  source: "game" | "payment";
  event: string;
  turnover: number | null;
  payout: number | null;
  amount: number;
  previousBalance: number;
  newBalance: number;
  gameName: string | null;
  provider: string | null;
  date: string;
}

export interface TransactionHistoryResponse {
  data: TransactionRecord[];
  total: number;
  limit: number;
  offset: number;
}

export async function apiGetTransactionHistory(
  token: string,
  opts: { limit?: number; offset?: number; source?: "game" | "payment" } = {},
): Promise<TransactionHistoryResponse> {
  const res = await fetch(`${API_URL}/api/users/transactionHistory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      limit: opts.limit ?? 10,
      offset: opts.offset ?? 0,
      source: opts.source,
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch transaction history");
  return res.json();
}
