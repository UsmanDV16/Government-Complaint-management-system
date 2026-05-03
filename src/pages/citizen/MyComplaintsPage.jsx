import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/complaints")
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "department",
      header: "Department",
      render: (row) => row.departmentId?.name || "-"
    },
    {
      key: "type",
      header: "Type",
      render: (row) => row.typeId?.name || "General"
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`badge status-${row.status}`}>
          {statusLabelMap[row.status] || row.status}
        </span>
      )
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: "action",
      header: "Action",
      render: (row) => {
        if (row.status === "citizen_verifying") {
          return <Link to={`/citizen/complaints/${row._id}`}>Respond</Link>;
        }
        return <Link to={`/citizen/complaints/${row._id}`}>View</Link>;
      }
    }
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Citizen</p>
          <h2>My Complaints</h2>
          <p className="muted">Monitor your ongoing cases and history.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {isLoading ? (
        <div className="card"><LoadingSpinner label="Loading complaints" size="lg" /></div>
      ) : (
        <DataTable columns={columns} rows={complaints} rowKey="_id" />
      )}
    </section>
  );
}

export default MyComplaintsPage;
