import { Link } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";

function DepartmentComplaintsPage() {
  const { complaints, currentUser } = useAuth();
  const rows = complaints.filter((c) => c.departmentId === currentUser.departmentId);
  const columns = [
    { key: "title", header: "Title" },
    { key: "status", header: "Status" },
    { key: "category", header: "Category" },
    { key: "createdAt", header: "Date" },
    {
      key: "action",
      header: "Action",
      render: (row) => <Link to={`/department/complaints/${row.id}/update`}>Update</Link>
    }
  ];

  return (
    <section>
      <h2>Department Complaints</h2>
      <DataTable columns={columns} rows={rows} />
    </section>
  );
}

export default DepartmentComplaintsPage;
