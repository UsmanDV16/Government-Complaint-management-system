import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

function CitizenDashboard() {
  const { complaints, currentUser } = useAuth();
  const myComplaints = complaints.filter((c) => c.citizenId === currentUser.id);
  const recent = myComplaints.slice(0, 5);

  return (
    <section>
      <h2>Citizen Dashboard</h2>
      <div className="grid-3">
        <StatCard title="Total Complaints" value={myComplaints.length} />
        <StatCard
          title="Pending"
          value={myComplaints.filter((c) => c.status === "Pending").length}
        />
        <StatCard
          title="Resolved"
          value={myComplaints.filter((c) => c.status === "Resolved").length}
        />
      </div>

      <h3>Recent Complaints</h3>
      <div className="card list-card">
        {recent.length === 0 ? (
          <p className="muted">No complaints yet.</p>
        ) : (
          recent.map((item) => (
            <div key={item.id} className="list-item">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.category}</p>
              </div>
              <div>
                <span className={`badge badge-${item.status.replace(" ", "-").toLowerCase()}`}>
                  {item.status}
                </span>
                <Link to={`/citizen/complaints/${item.id}`}>View</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CitizenDashboard;
