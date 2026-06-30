const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
