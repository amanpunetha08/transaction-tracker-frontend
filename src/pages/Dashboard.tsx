import { useEffect, useState } from "react";
import { getSummary, syncEmails, getMe } from "../services/api";
import type { Summary } from "../types";
import "./Dashboard.css";

interface Account { id: number; email: string }

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [days, setDays] = useState(30);
  const [account, setAccount] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    getMe().then((r) => setAccounts(r.gmail_accounts?.map((a) => ({ id: a.id, email: a.email })) || []));
  }, []);

  const loadData = () => {
    getSummary(days, account).then(setSummary).catch(() => setError("Failed to load data."));
  };

  useEffect(loadData, [days, account]);

  const handleSync = () => {
    setSyncing(true);
    setSyncMsg("");
    syncEmails(days)
      .then((r) => { setSyncMsg(`Synced! ${r.total_synced} new transactions.`); loadData(); })
      .catch(() => setSyncMsg("Sync failed."))
      .finally(() => setSyncing(false));
  };

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p className="loading">Loading...</p>;

  const maxTotal = Math.max(...summary.by_merchant.map((m) => m.total), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "⟳ Sync Emails"}
          </button>
          {accounts.length > 1 && (
            <select value={account || ""} onChange={(e) => setAccount(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">All Accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.email}</option>)}
            </select>
          )}
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {syncMsg && <p className="sync-msg">{syncMsg}</p>}

      <div className="cards">
        <div className="card card-debit">
          <span className="card-label">Total Spent</span>
          <span className="card-value">₹{summary.total_debit.toLocaleString()}</span>
        </div>
        <div className="card card-credit">
          <span className="card-label">Total Received</span>
          <span className="card-value">₹{summary.total_credit.toLocaleString()}</span>
        </div>
        <div className="card card-net">
          <span className="card-label">Net</span>
          <span className="card-value">₹{(summary.total_credit - summary.total_debit).toLocaleString()}</span>
        </div>
      </div>

      <div className="chart-section">
        <h2>Top Spending</h2>
        {summary.by_merchant.length === 0 ? (
          <p className="empty">No transactions yet. Click "Sync Emails" above!</p>
        ) : (
          <div className="bar-chart">
            {summary.by_merchant.map((m) => (
              <div className="bar-row" key={m.merchant}>
                <span className="bar-label">{m.merchant}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(m.total / maxTotal) * 100}%` }} />
                </div>
                <span className="bar-value">₹{m.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
