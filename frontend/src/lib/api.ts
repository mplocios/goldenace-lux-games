const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
} = {}): Promise<DbGame[]> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.provider) query.set("provider", params.provider);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.is_active !== undefined) query.set("is_active", String(params.is_active));

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
