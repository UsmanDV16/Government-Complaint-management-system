import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { complaints, users, departments } = useAuth();

  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div className="grid-3">
        <StatCard title="Total Complaints" value={complaints.length} />
        <StatCard title="Total Citizens" value={users.filter((u) => u.role === "citizen").length} />
        <StatCard title="Departments" value={departments.length} />
      </div>
    </section>
  );
}

export default AdminDashboard;
