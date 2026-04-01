import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

function DepartmentDashboard() {
  const { complaints, currentUser } = useAuth();
  const myDeptComplaints = complaints.filter(
    (c) => c.departmentId === currentUser.departmentId
  );

  return (
    <section>
      <h2>Department Dashboard</h2>
      <div className="grid-3">
        <StatCard title="Total Complaints" value={myDeptComplaints.length} />
        <StatCard
          title="In Progress"
          value={myDeptComplaints.filter((c) => c.status === "In Progress").length}
        />
        <StatCard
          title="Resolved"
          value={myDeptComplaints.filter((c) => c.status === "Resolved").length}
        />
      </div>
    </section>
  );
}

export default DepartmentDashboard;
