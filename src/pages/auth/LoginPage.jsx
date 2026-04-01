import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "citizen@gov.com",
    password: "123456",
    role: "citizen"
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form);
    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate(`/${form.role}/dashboard`);
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="muted">Use demo credentials and select your role.</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        >
          <option value="citizen">Citizen</option>
          <option value="department">Department Officer</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Login
        </button>
        <p>
          New citizen? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
