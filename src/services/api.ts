import type { Summary, TransactionsResponse } from "../types";

async function fetchJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

function post<T>(url: string, data: object) {
  return fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// User auth
export const register = (username: string, password: string, email: string) =>
  post<{ id: number; username: string }>("/api/register/", { username, password, email });

export const login = (username: string, password: string) =>
  post<{ id: number; username: string }>("/api/login/", { username, password });

export const logout = () => post<{ status: string }>("/api/logout/", {});

export interface GmailAccountInfo {
  id: number;
  email: string;
  connected: boolean;
  connected_at: string;
}

export interface MeResponse {
  authenticated: boolean;
  id?: number;
  username?: string;
  gmail_accounts?: GmailAccountInfo[];
}

export const getMe = () => fetchJson<MeResponse>("/api/me/");

// Gmail accounts
export const addEmail = (email: string) =>
  post<{ id: number; email: string; connected: boolean }>("/api/accounts/add/", { email });

export const removeAccount = (id: number) =>
  post<{ status: string }>(`/api/accounts/${id}/remove/`, {});

export const connectGmailUrl = (accountId: number) => `/auth/connect/${accountId}/`;

// Data
export const getSummary = (days?: number, account?: number) => {
  let url = `/api/summary/?days=${days || 30}`;
  if (account) url += `&account=${account}`;
  return fetchJson<Summary>(url);
};

export const getTransactions = (days?: number, type?: string, account?: number) => {
  let url = `/api/transactions/?days=${days || 30}`;
  if (type) url += `&type=${type}`;
  if (account) url += `&account=${account}`;
  return fetchJson<TransactionsResponse>(url);
};

export const syncEmails = (days = 30) =>
  fetchJson<{ total_synced: number; total_emails: number; accounts: object[] }>(`/api/sync/?days=${days}`);

export const dismissTransaction = (id: number) =>
  post<{ status: string }>(`/api/transactions/${id}/dismiss/`, {});

export const keepTransaction = (id: number) =>
  post<{ status: string }>(`/api/transactions/${id}/keep/`, {});
