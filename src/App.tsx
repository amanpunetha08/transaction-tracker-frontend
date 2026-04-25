import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, logout, type MeResponse } from "./services/api";
import Auth from "./pages/Auth";
import Accounts from "./pages/Accounts";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    getMe()
      .then(setUser)
      .catch(() => setUser({ authenticated: false }))
      .finally(() => setLoading(false));
  };

  useEffect(checkAuth, []);

  if (loading) return <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>;

  if (!user?.authenticated) {
    return <Auth onAuth={checkAuth} />;
  }

  return (
    <BrowserRouter>
      <nav className="nav">
        <span className="nav-brand">₹ Tracker</span>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <span className="nav-user">{user.username}</span>
          <button onClick={() => logout().then(checkAuth)}>Logout</button>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
