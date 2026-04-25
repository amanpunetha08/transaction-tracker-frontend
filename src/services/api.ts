import type { Summary, TransactionsResponse } from "../types";

// No BASE_URL needed — Vite proxy forwards /api and /auth to Django

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Auth
export const getAuthStatus = () => fetchJson<{ authenticated: boolean }>("/auth/status/");
export const loginUrl = "/auth/login/";
export const logout = () => fetchJson<{ status: string }>("/auth/logout/");

// Data
export const getSummary = (days = 30) => fetchJson<Summary>(`/api/summary/?days=${days}`);
export const getTransactions = (days = 30, type?: "debit" | "credit") => {
  let url = `/api/transactions/?days=${days}`;
  if (type) url += `&type=${type}`;
  return fetchJson<TransactionsResponse>(url);
};
export const syncEmails = (days = 30) => fetchJson<{ synced: number; total_emails: number }>(`/api/sync/?days=${days}`);
