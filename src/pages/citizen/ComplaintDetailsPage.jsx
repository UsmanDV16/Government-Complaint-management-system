import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ComplaintDetailsPage() {
  const { id } = useParams();
  const { complaints, departments } = useAuth();
  const complaint = complaints.find((c) => c.id === id);
  const departmentName =
    departments.find((d) => d.id === complaint?.departmentId)?.name || "Unassigned";

  if (!complaint) {
    return <p className="error-text">Complaint not found.</p>;
  }

  return (
    <section>
      <h2>Complaint Details</h2>
      <div className="card details-card">
        <p>
          <strong>Title:</strong> {complaint.title}
        </p>
        <p>
          <strong>Description:</strong> {complaint.description}
        </p>
        <p>
          <strong>Category:</strong> {complaint.category}
        </p>
        <p>
          <strong>Department:</strong> {departmentName}
        </p>
        <p>
          <strong>Status:</strong> {complaint.status}
        </p>
        <p>
          <strong>Remarks:</strong> {complaint.remarks || "No remarks yet."}
        </p>
        <Link to="/citizen/complaints">Back to list</Link>
      </div>
    </section>
  );
}

export default ComplaintDetailsPage;
