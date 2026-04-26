import { useEffect, useState } from "react";
import { getTransactions, getMe, dismissTransaction, keepTransaction } from "../services/api";
import type { Transaction } from "../types";
import "./Transactions.css";

interface Account { id: number; email: string }

export default function Transactions() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [days, setDays] = useState(30);
  const [typeFilter, setTypeFilter] = useState("");
  const [account, setAccount] = useState<number | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then((r) => setAccounts(r.gmail_accounts?.map((a) => ({ id: a.id, email: a.email })) || []));
  }, []);

  const loadData = () => {
    getTransactions(days, typeFilter || undefined, account)
      .then((r) => setTxns(r.transactions))
      .catch(() => setError("Failed to load."));
  };

  useEffect(loadData, [days, typeFilter, account]);

  const handleDismiss = async (id: number) => {
    await dismissTransaction(id);
    loadData();
  };

  const handleKeep = async (id: number) => {
    await keepTransaction(id);
    loadData();
  };

  // Group transactions by date
  const grouped = txns.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.date] = acc[t.date] || []).push(t);
    return acc;
  }, {});

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="transactions">
      <div className="txn-header">
        <h1>Transactions</h1>
        <div className="txn-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
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

      {txns.length === 0 ? (
        <p className="empty">No transactions found.</p>
      ) : (
        <div className="txn-list">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="txn-group">
              <div className="txn-date-header">
                <span>{formatDate(date)}</span>
                <span className="txn-date-total">
                  {items.length} transaction{items.length > 1 ? "s" : ""}
                </span>
              </div>
              {items.map((t) => (
                <div key={t.id} className={`txn-card ${t.is_duplicate ? "txn-card-dup" : ""}`}>
                  <div className="txn-icon">
                    <span className={`txn-arrow ${t.type}`}>
                      {t.type === "debit" ? "↑" : "↓"}
                    </span>
                  </div>
                  <div className="txn-details">
                    <span className="txn-merchant">{t.merchant}</span>
                    <span className="txn-meta">
                      {t.account_email && <span className="txn-account">{t.account_email}</span>}
                      {t.is_duplicate && <span className="txn-dup-badge">Possible duplicate</span>}
                    </span>
                  </div>
                  <div className="txn-right">
                    <span className={`txn-amount ${t.type}`}>
                      {t.type === "debit" ? "−" : "+"}₹{t.amount.toLocaleString()}
                    </span>
                    {t.is_duplicate && (
                      <div className="dup-actions">
                        <button className="keep-btn" onClick={() => handleKeep(t.id)}>Not Duplicate</button>
                        <button className="dismiss-btn" onClick={() => handleDismiss(t.id)}>Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
