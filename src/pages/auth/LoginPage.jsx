import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await login(form);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }
    navigate(`/${result.user.role}/dashboard`);
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="form-header">
          <p className="eyebrow">Citizen access</p>
          <h2>Sign in to lodge and track complaints</h2>
          <p className="muted">Use your CNIC or email to continue.</p>
        </div>
        <label htmlFor="identifier">CNIC or Email</label>
        <input
          id="identifier"
          value={form.identifier}
          onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
          placeholder="35202-0000000-1"
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner label="Signing in" size="sm" /> : "Login"}
        </button>
        <p className="muted">
          New citizen? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
