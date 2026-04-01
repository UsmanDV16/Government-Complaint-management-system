import { Link } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";

function MyComplaintsPage() {
  const { complaints, currentUser } = useAuth();
  const myComplaints = complaints.filter((c) => c.citizenId === currentUser.id);

  const columns = [
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    { key: "createdAt", header: "Date" },
    {
      key: "action",
      header: "Action",
      render: (row) => <Link to={`/citizen/complaints/${row.id}`}>View Details</Link>
    }
  ];

  return (
    <section>
      <h2>My Complaints</h2>
      <DataTable columns={columns} rows={myComplaints} />
    </section>
  );
}

export default MyComplaintsPage;
