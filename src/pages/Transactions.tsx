import { useEffect, useState } from "react";
import { getTransactions } from "../services/api";
import type { Transaction } from "../types";
import "./Transactions.css";

export default function Transactions() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [days, setDays] = useState(30);
  const [typeFilter, setTypeFilter] = useState<"" | "debit" | "credit">("");
  const [error, setError] = useState("");

  useEffect(() => {
    getTransactions(days, typeFilter || undefined)
      .then((res) => setTxns(res.transactions))
      .catch(() => setError("Failed to load. Is the backend running?"));
  }, [days, typeFilter]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="transactions">
      <div className="txn-header">
        <h1>Transactions</h1>
        <div className="txn-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "" | "debit" | "credit")}>
            <option value="">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {txns.length === 0 ? (
        <p className="empty">No transactions found. Sync your emails first!</p>
      ) : (
        <table className="txn-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.merchant}</td>
                <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                <td className={`amount amount-${t.type}`}>₹{t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
