import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function RegisterPage() {
  const navigate = useNavigate();
  const { registerCitizen } = useAuth();
  const [form, setForm] = useState({ name: "", cnic: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await registerCitizen(form);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }
    navigate("/citizen/dashboard");
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="form-header">
          <p className="eyebrow">Citizen access</p>
          <h2>Create a complaint account</h2>
          <p className="muted">Track, review, and follow your requests.</p>
        </div>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <label htmlFor="cnic">CNIC</label>
        <input
          id="cnic"
          value={form.cnic}
          onChange={(e) => setForm((prev) => ({ ...prev, cnic: e.target.value }))}
          placeholder="35202-0000000-1"
          required
        />
        <label htmlFor="email">Email (optional)</label>
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
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner label="Creating account" size="sm" /> : "Create Account"}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p className="muted">
          Department or admin? <Link to="/staff/login">Go to staff login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
