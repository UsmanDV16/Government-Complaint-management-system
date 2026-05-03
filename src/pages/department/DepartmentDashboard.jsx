import { useEffect, useState } from "react";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";

function DepartmentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/complaints")
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Department</p>
          <h2>Resolution Dashboard</h2>
          <p className="muted">Workload and response metrics.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {isLoading ? (
        <div className="card">
          <LoadingSpinner label="Loading dashboard" size="lg" />
        </div>
      ) : (
        <div className="grid-3">
          <StatCard title="Total" value={complaints.length} />
          <StatCard
            title="Unresolved"
            value={complaints.filter((c) => c.status === "unresolved").length}
          />
          <StatCard
            title="Awaiting Verification"
            value={complaints.filter((c) => c.status === "citizen_verifying").length}
          />
          <StatCard
            title="Accepted"
            value={complaints.filter((c) => c.status === "accepted").length}
          />
        </div>
      )}
    </section>
  );
}

export default DepartmentDashboard;
