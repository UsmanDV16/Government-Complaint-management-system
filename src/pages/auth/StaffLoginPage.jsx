import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function StaffLoginPage() {
  const navigate = useNavigate();
  const { loginStaff, logout } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await loginStaff(form);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }
    if (!['admin', 'department'].includes(result.user.role)) {
      logout();
      setError("This portal is only for department and admin accounts.");
      setIsSubmitting(false);
      return;
    }
    navigate(`/${result.user.role}/dashboard`);
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="form-header">
          <p className="eyebrow">Staff access</p>
          <h2>Department & admin login</h2>
          <p className="muted">Use your staff username to continue.</p>
        </div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          placeholder="staff.username"
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
      </form>
    </div>
  );
}

export default StaffLoginPage;
