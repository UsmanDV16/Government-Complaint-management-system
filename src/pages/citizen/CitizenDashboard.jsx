import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { statusLabelMap } from "../../utils/complaints";

function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/complaints")
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const recent = complaints.slice(0, 5);
  const activeStatuses = ["unresolved", "citizen_verifying", "admin_reviewing"];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Citizen</p>
          <h2>Complaint Overview</h2>
          <p className="muted">Track progress and provide feedback.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {isLoading ? (
        <div className="card">
          <LoadingSpinner label="Loading dashboard" size="lg" centered />
        </div>
      ) : (
        <>
          <div className="grid-3">
            <StatCard title="Total" value={complaints.length} />
            <StatCard
              title="Active"
              value={complaints.filter((c) => activeStatuses.includes(c.status)).length}
            />
            <StatCard
              title="Accepted"
              value={complaints.filter((c) => c.status === "accepted").length}
            />
          </div>

          <div className="section-header">
            <h3>Recent Complaints</h3>
            <Link to="/citizen/complaints" className="link">
              View all
            </Link>
          </div>
          <div className="card list-card">
            {recent.length === 0 ? (
              <p className="muted">No complaints yet.</p>
            ) : (
              recent.map((item) => (
                <div key={item._id} className="list-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p className="muted">
                      {item.typeId?.name || "General"} • {item.departmentId?.name}
                    </p>
                  </div>
                  <div className="list-actions">
                    <span className={`badge status-${item.status}`}>
                      {statusLabelMap[item.status] || item.status}
                    </span>
                    <Link to={`/citizen/complaints/${item._id}`}>View</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default CitizenDashboard;
