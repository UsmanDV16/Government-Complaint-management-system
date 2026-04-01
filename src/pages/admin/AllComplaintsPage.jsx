import DataTable from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";

function AllComplaintsPage() {
  const { complaints, departments } = useAuth();
  const getDepartment = (id) =>
    departments.find((d) => d.id === id)?.name || "Unknown Department";

  const columns = [
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    {
      key: "department",
      header: "Department",
      render: (row) => getDepartment(row.departmentId)
    },
    { key: "createdAt", header: "Date" }
  ];

  return (
    <section>
      <h2>All Complaints</h2>
      <DataTable columns={columns} rows={complaints} />
    </section>
  );
}

export default AllComplaintsPage;
