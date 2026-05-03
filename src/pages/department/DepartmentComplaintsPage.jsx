import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function DepartmentComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortByPriority, setSortByPriority] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const qs = new URLSearchParams();
    if (priorityFilter) qs.set("priority", priorityFilter);
    if (sortByPriority) qs.set("sort", "priority");
    const url = `/complaints${qs.toString() ? `?${qs.toString()}` : ""}`;
    apiFetch(url)
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [priorityFilter, sortByPriority]);

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <select
          value={row.priority || "medium"}
          onChange={async (e) => {
            const newPriority = e.target.value;
            const previous = row.priority || "medium";
            // optimistic update
            setComplaints((prev) => prev.map((r) => (r._id === row._id ? { ...r, priority: newPriority } : r)));
            try {
              const payload = new FormData();
              payload.append("priority", newPriority);
              await apiFetch(`/complaints/${row._id}/department-update`, {
                method: "PATCH",
                body: payload
              });
            } catch (err) {
              setError(err.message || "Failed to update priority");
              // revert
              setComplaints((prev) => prev.map((r) => (r._id === row._id ? { ...r, priority: previous } : r)));
            }
          }}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      )
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
      render: (row) =>
        row.status === "unresolved" ? (
          <Link to={`/department/complaints/${row._id}/update`}>Resolve</Link>
        ) : (
          <span className="muted" style={{ fontSize: "0.8rem" }}>No action</span>
        )
    }
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Department</p>
          <h2>Department Complaints</h2>
          <p className="muted">Resolve and verify department backlog.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label className="muted">Filter by priority</label>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label className="muted" style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={sortByPriority} onChange={(e) => setSortByPriority(e.target.checked)} /> Sort by priority
        </label>
      </div>
      {isLoading ? (
        <div className="card"><LoadingSpinner label="Loading complaints" size="lg" centered /></div>
      ) : (
        <DataTable columns={columns} rows={complaints} rowKey="_id" />
      )}
    </section>
  );
}

export default DepartmentComplaintsPage;
