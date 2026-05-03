import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function AllComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setIsLoading(true);
    apiFetch("/complaints")
      .then((complaintsRes) => setComplaints(complaintsRes.complaints))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "department",
      header: "Department",
      render: (row) => row.departmentId?.name || "-"
    },
    {
      key: "citizen",
      header: "Citizen",
      render: (row) => row.citizenId ? `${row.citizenId.name} (${row.citizenId.cnic})` : "-"
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
      key: "rating",
      header: "Rating",
      render: (row) => (row.citizenRating?.stars ? `${row.citizenRating.stars} ★` : "-")
    },
    {
      key: "resolutionTime",
      header: "Resolution Time",
      render: (row) => {
        if (!row.departmentResolvedAt) return "-";
        return row.resolutionTimeHours ? `${row.resolutionTimeHours} hrs` : "Not recorded";
      }
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
        if (row.status === "admin_reviewing") {
          return <Link to={`/admin/complaints/${row._id}/review`}>Review Decline</Link>;
        }
        return <span className="muted">-</span>;
      }
    }
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>All Complaints</h2>
          <p className="muted">Track complaints and open decline reviews when needed.</p>
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

export default AllComplaintsPage;
