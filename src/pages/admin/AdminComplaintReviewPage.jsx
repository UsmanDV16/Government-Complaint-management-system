import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function AdminComplaintReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [action, setAction] = useState("reassign");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch(`/complaints/${id}`),
      apiFetch("/departments")
    ])
      .then(([complaintData, deptData]) => {
        setComplaint(complaintData.complaint);
        setDepartments(deptData.departments);
        // Default to empty = keep same department
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const body = {
        action,
        adminNotes
      };
      if (action === "reassign" && selectedDept) {
        // Only send departmentId if different from current
        if (selectedDept !== complaint.departmentId?._id) {
          body.departmentId = selectedDept;
        }
      }
      const data = await apiFetch(`/complaints/${id}/admin-review`, {
        method: "PATCH",
        body
      });
      setMessage(`Complaint ${action === "reassign" ? "reassigned" : "declined"} successfully.`);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner centered />;
  if (error && !complaint) return <p className="error-text">{error}</p>;
  if (!complaint) return <p className="error-text">Complaint not found.</p>;

  if (complaint.status !== "admin_reviewing") {
    return (
      <section>
        <p className="error-text">This complaint is not under admin review.</p>
        <p>Current status: {statusLabelMap[complaint.status] || complaint.status}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Review</p>
          <h2>Citizen Declined Resolution</h2>
          <p className="muted">Review the citizen's reason and proof, then either send the complaint back to a department or close it.</p>
        </div>
      </div>

      <div className="card details-card">
        <h3>{complaint.title}</h3>
        <p className="muted">{complaint.typeId?.name || "General"}</p>
        <p>{complaint.description}</p>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Department (Current)</p>
            <p>{complaint.departmentId?.name}</p>
          </div>
          <div>
            <p className="detail-label">Complaint Status</p>
            <span className={`badge status-${complaint.status}`}>
              {statusLabelMap[complaint.status] || complaint.status}
            </span>
          </div>
          {complaint.previousDepartmentId && (
            <div>
              <p className="detail-label">Previous Department</p>
              <p>{complaint.previousDepartmentId?.name}</p>
            </div>
          )}
        </div>

        <div className="detail-block">
          <p className="detail-label">Initial Citizen Complaint Proofs</p>
          {complaint.citizenProofs?.length ? (
            <div className="proof-grid">
              {complaint.citizenProofs.map((proof) => (
                <a key={proof.publicId} href={proof.url} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No proofs.</p>
          )}
        </div>

        <div className="detail-block">
          <p className="detail-label">Department Resolution Attempt</p>
          <p><strong>Notes:</strong> {complaint.departmentNotes || "None"}</p>
          <p><strong>Time Spent:</strong> {complaint.resolutionTimeHours || "Not recorded"} hours</p>
          {complaint.departmentProofs?.length ? (
            <div className="proof-grid">
              {complaint.departmentProofs.map((proof) => (
                <a key={proof.publicId} href={proof.url} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No proofs.</p>
          )}
        </div>

        <div className="detail-block">
          <p className="detail-label">Citizen Decline Reason</p>
          <p>{complaint.citizenDeclineReason || "No reason provided."}</p>
        </div>

        <div className="detail-block">
          <p className="detail-label">Citizen Decline Proofs</p>
          {complaint.citizenDeclineProofs?.length ? (
            <div className="proof-grid">
              {complaint.citizenDeclineProofs.map((proof) => (
                <a key={proof.publicId} href={proof.url} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No decline proofs provided.</p>
          )}
        </div>
      </div>

      <form className="card form-card" onSubmit={handleReview}>
        <h3>Admin Action</h3>
        
        <label htmlFor="action">Choose Action *</label>
        <select
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
        >
          <option value="reassign">Send Back to Department</option>
          <option value="decline">Close Complaint</option>
        </select>

        {action === "reassign" && (
          <>
            <label htmlFor="department">Select Department (optional)</label>
            <select
              id="department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Keep Same Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}{dept._id === complaint.departmentId?._id ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="adminNotes">Admin Notes (optional)</label>
        <textarea
          id="adminNotes"
          rows="4"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder={action === "reassign" ? "Explain why reassigning to this department..." : "Explain why declining this complaint..."}
        />

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button
          type="submit"
          className={action === "decline" ? "btn btn-danger" : "btn btn-primary"}
          disabled={isSubmitting || Boolean(message)}
        >
          {isSubmitting ? "Processing..." : action === "reassign" ? "Send Back" : "Close Complaint"}
        </button>
      </form>
    </section>
  );
}

export default AdminComplaintReviewPage;
