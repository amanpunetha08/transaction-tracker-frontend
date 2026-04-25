import { useEffect, useState } from "react";
import { getMe, addEmail, removeAccount, connectGmailUrl, type GmailAccountInfo } from "../services/api";
import "./Accounts.css";

export default function Accounts() {
  const [accounts, setAccounts] = useState<GmailAccountInfo[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMe().then((r) => {
      setAccounts(r.gmail_accounts || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await addEmail(newEmail);
      setNewEmail("");
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this email? Its transactions will remain.")) return;
    await removeAccount(id);
    load();
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="accounts">
      <h1>Gmail Accounts</h1>

      {/* Add email form */}
      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="email"
          placeholder="Enter Gmail address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="add-error">{error}</p>}

      {/* Account list */}
      {accounts.length === 0 ? (
        <p className="empty-state">No emails added yet. Add a Gmail above to get started.</p>
      ) : (
        <div className="account-list">
          {accounts.map((a) => (
            <div className="account-card" key={a.id}>
              <div className="account-info">
                <span className="account-email">{a.email}</span>
                <span className={`account-status ${a.connected ? "status-connected" : "status-pending"}`}>
                  {a.connected ? "✅ Connected" : "⏳ Not connected"}
                </span>
              </div>
              <div className="account-actions">
                {!a.connected && (
                  <a href={connectGmailUrl(a.id)} className="connect-btn">Connect Gmail</a>
                )}
                <button className="remove-btn" onClick={() => handleRemove(a.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="accounts-hint">
        Add your Gmail addresses, then click "Connect Gmail" to authorize read access for each one.
      </p>
    </div>
  );
}
