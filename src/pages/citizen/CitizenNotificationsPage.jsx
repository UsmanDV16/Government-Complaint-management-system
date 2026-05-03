import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function CitizenNotificationsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/complaints")
      .then((data) => setComplaints(data.complaints || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const notifications = useMemo(() => {
    return complaints
      .flatMap((complaint) => {
        const items = [];

        if (complaint.status === "citizen_verifying") {
          items.push({
            id: `${complaint._id}-response`,
            type: "action-needed",
            title: "Response needed",
            message: `Your complaint "${complaint.title}" is waiting for your response.`,
            detail: `Department: ${complaint.departmentId?.name || "Unassigned"}`,
            updatedAt: complaint.departmentResolvedAt || complaint.updatedAt,
            complaintId: complaint._id,
            cta: "Review response"
          });
        }

        if (complaint.status === "unresolved" && complaint.reassignmentCount > 0) {
          items.push({
            id: `${complaint._id}-reassigned`,
            type: "reassigned",
            title: "Reassigned by admin",
            message: `Your complaint "${complaint.title}" was sent back for another review.`,
            detail: `Now handled by: ${complaint.departmentId?.name || "Assigned department"}`,
            updatedAt: complaint.adminActionAt || complaint.updatedAt,
            complaintId: complaint._id,
            cta: "Open complaint"
          });
        }

        return items;
      })
      .filter((item) => {
        // hide notifications older than 10 days (still stored in DB)
        const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        const updated = new Date(item.updatedAt || item.createdAt || Date.now());
        return updated >= cutoff;
      })
      .sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt));
  }, [complaints]);

  const pendingCount = notifications.filter((item) => item.type === "action-needed").length;
  const reassignedCount = notifications.filter((item) => item.type === "reassigned").length;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Citizen</p>
          <h2>Notifications</h2>
          <p className="muted">Track response requests and admin reassignments from one place.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {isLoading ? (
        <div className="card">
          <LoadingSpinner label="Loading notifications" size="lg" centered />
        </div>
      ) : (
        <>
          <div className="grid-3">
            <div className="card notification-summary">
              <p className="muted">Total notifications</p>
              <h3 className="stat-value">{notifications.length}</h3>
            </div>
            <div className="card notification-summary">
              <p className="muted">Needs your response</p>
              <h3 className="stat-value">{pendingCount}</h3>
            </div>
            <div className="card notification-summary">
              <p className="muted">Reassigned by admin</p>
              <h3 className="stat-value">{reassignedCount}</h3>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="card">
              <p className="muted">No notifications yet. We will show updates here when a complaint needs your response or gets reassigned.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((item) => (
                <article key={item.id} className={`card notification-item ${item.type}`}>
                  <span className="notification-dot" aria-hidden="true" />
                  <div className="notification-item-body">
                    <div className="section-header" style={{ justifyContent: "flex-start" }}>
                      <h3>{item.title}</h3>
                      <span className="badge">{item.type === "action-needed" ? "Action" : "Update"}</span>
                    </div>
                    <p>{item.message}</p>
                    <p className="muted">{item.detail}</p>
                    <p className="muted">Updated: {formatDate(item.updatedAt)}</p>
                    <p className="muted">Status: {statusLabelMap[complaints.find((complaint) => complaint._id === item.complaintId)?.status] || "Open"}</p>
                  </div>
                  <div className="notification-actions">
                    <Link className="btn btn-outline" to={`/citizen/complaints/${item.complaintId}`}>
                      {item.cta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CitizenNotificationsPage;