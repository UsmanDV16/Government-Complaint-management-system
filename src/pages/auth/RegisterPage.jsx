import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { registerCitizen } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = registerCitizen(form);
    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate("/citizen/dashboard");
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Citizen Registration</h2>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Create Account
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
