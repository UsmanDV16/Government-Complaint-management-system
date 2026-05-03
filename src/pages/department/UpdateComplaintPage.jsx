import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function UpdateComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [departmentNotes, setDepartmentNotes] = useState("");
  const [resolutionTimeHours, setResolutionTimeHours] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/complaints/${id}`)
      .then((data) => {
        setComplaint(data.complaint);
        setDepartmentNotes(data.complaint.departmentNotes || "");
        setResolutionTimeHours(data.complaint.resolutionTimeHours || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const resolveDialogRef = useRef(null);
  const openResolveDialog = () => resolveDialogRef.current?.showModal();
  const closeResolveDialog = () => resolveDialogRef.current?.close();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("departmentNotes", departmentNotes);
      if (resolutionTimeHours) payload.append("resolutionTimeHours", resolutionTimeHours);
      files.forEach((file) => payload.append("resolutionProofs", file));

      await apiFetch(`/complaints/${id}/department-update`, {
        method: "PATCH",
        body: payload
      });
      closeResolveDialog();
      navigate("/department/complaints");
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="card"><LoadingSpinner label="Loading complaint" size="lg" centered /></div>;
  if (error) return <p className="error-text">{error}</p>;
  if (!complaint) return <p className="error-text">Complaint not found.</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Department</p>
          <h2>Resolve Complaint</h2>
          <p className="muted">Update resolution details and proofs.</p>
        </div>
        <span className={`badge status-${complaint.status}`}>
          {statusLabelMap[complaint.status] || complaint.status}
        </span>
      </div>

      <div className="card details-card">
        <h3>{complaint.title}</h3>
        <p className="muted">{complaint.typeId?.name || "General"}</p>
        <p>{complaint.description}</p>
        <div className="detail-grid">
          <div>
            <p className="detail-label">Created</p>
            <p>{formatDate(complaint.createdAt)}</p>
          </div>
          <div>
            <p className="detail-label">Citizen Rating</p>
            <p>{complaint.citizenRating?.stars ? `${complaint.citizenRating.stars} stars` : "-"}</p>
          </div>
        </div>
      </div>

      <div className="card form-card">
        <p className="muted">When ready, mark the complaint as resolved and attach any resolution proofs.</p>
        {error && <p className="error-text">{error}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn btn-primary" onClick={openResolveDialog}>
            Resolve Complaint
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/department/complaints')}>
            Back to list
          </button>
        </div>
      </div>

      <dialog ref={resolveDialogRef} className="modal-dialog" onClose={() => {}}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Resolve Complaint</h3>
            <button type="button" className="btn btn-ghost" onClick={closeResolveDialog} disabled={isSaving}>
              Close
            </button>
          </div>

          <form className="modal-form" onSubmit={onSubmit}>
            <label htmlFor="resolutionTime">Resolution Time (hrs)</label>
            <input
              id="resolutionTime"
              type="number"
              min="0"
              step="0.5"
              value={resolutionTimeHours}
              onChange={(e) => setResolutionTimeHours(e.target.value)}
            />

            <label htmlFor="departmentNotes">Resolution Notes</label>
            <textarea
              id="departmentNotes"
              rows="5"
              value={departmentNotes}
              onChange={(e) => setDepartmentNotes(e.target.value)}
            />

            <label htmlFor="resolutionProofs">Upload Resolution Proofs</label>
            <input
              id="resolutionProofs"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeResolveDialog} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className={`btn btn-primary`} disabled={isSaving}>
                {isSaving ? <LoadingSpinner label="Saving" size="sm" /> : "Mark as Resolved"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </section>
  );
}

export default UpdateComplaintPage;
