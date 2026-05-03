import { useEffect, useState } from "react";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/complaints"),
      apiFetch("/users?role=citizen"),
      apiFetch("/departments")
    ])
      .then(([complaintsRes, usersRes, departmentsRes]) => {
        const all = complaintsRes.complaints;
        setMetrics({
          total: all.length,
          unresolved: all.filter((c) => c.status === "unresolved").length,
          adminReview: all.filter((c) => c.status === "admin_reviewing").length,
          citizens: usersRes.users.length,
          departments: departmentsRes.departments.length
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Command Center</h2>
          <p className="muted">System health and coverage overview.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {isLoading ? (
        <div className="card">
          <LoadingSpinner label="Loading dashboard" size="lg" />
        </div>
      ) : metrics && (
        <div className="grid-3">
          <StatCard title="Total Complaints" value={metrics.total} />
          <StatCard title="Unresolved" value={metrics.unresolved} />
          <StatCard title="Pending Admin Review" value={metrics.adminReview} />
          <StatCard title="Citizens" value={metrics.citizens} />
          <StatCard title="Departments" value={metrics.departments} />
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;
