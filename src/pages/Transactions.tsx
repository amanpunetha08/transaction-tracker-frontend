import { useEffect, useState } from "react";
import { getTransactions, getMe } from "../services/api";
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

  useEffect(() => {
    getTransactions(days, typeFilter || undefined, account)
      .then((r) => setTxns(r.transactions))
      .catch(() => setError("Failed to load."));
  }, [days, typeFilter, account]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="transactions">
      <div className="txn-header">
        <h1>Transactions</h1>
        <div className="txn-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
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
        <table className="txn-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Type</th>
              <th>Amount</th>
              {accounts.length > 1 && <th>Account</th>}
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.merchant}</td>
                <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                <td className={`amount amount-${t.type}`}>₹{t.amount.toLocaleString()}</td>
                {accounts.length > 1 && <td className="account-col">{t.account_email}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
