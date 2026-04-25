import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuthStatus, loginUrl, logout } from "./services/api";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import "./App.css";

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getAuthStatus().then((r) => setAuthed(r.authenticated)).catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>;

  if (!authed) {
    return (
      <div className="login-page">
        <h1>₹ Transaction Tracker</h1>
        <p>Sign in with Google to auto-track your bank transactions from email.</p>
        <a href={loginUrl} className="google-btn">Sign in with Google</a>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <nav className="nav">
        <span className="nav-brand">₹ Tracker</span>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <button onClick={() => logout().then(() => setAuthed(false))}>Logout</button>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
