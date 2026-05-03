import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";

function StarDisplay({ value = 0 }) {
  return (
    <span className="star-display" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star-mark ${value >= star ? "filled" : ""}`}>
          {value >= star ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function ComplaintDetailsPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [responseMode, setResponseMode] = useState("accept");
  const [responseStars, setResponseStars] = useState(0);
  const [responseReview, setResponseReview] = useState("");
  const [responseReason, setResponseReason] = useState("");
  const [responseFiles, setResponseFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const responseDialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch(`/complaints/${id}`)
      .then((data) => {
        setComplaint(data.complaint);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const openResponseDialog = () => {
    responseDialogRef.current?.showModal();
  };

  const closeResponseDialog = () => {
    responseDialogRef.current?.close();
  };

  const resetResponseState = () => {
    setResponseMode("accept");
    setResponseStars(0);
    setResponseReview("");
    setResponseReason("");
    setResponseFiles([]);
    setError("");
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (responseMode === "decline" && responseFiles.length === 0) {
      setError("You must upload at least one proof when declining a resolution.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("accept", responseMode === "accept" ? "true" : "false");
      if (responseMode === "accept") {
        if (responseStars) {
          payload.append("stars", String(responseStars));
        }
        if (responseReview.trim()) {
          payload.append("review", responseReview.trim());
        }
      } else {
        payload.append("declineReason", responseReason.trim());
      }
      responseFiles.forEach((file) => payload.append("proofs", file));

      const data = await apiFetch(`/complaints/${id}/citizen-verify`, {
        method: "PATCH",
        body: payload
      });
      setComplaint(data.complaint);
      closeResponseDialog();
      if (responseMode === "accept") {
        setMessage("Your acceptance and feedback were submitted.");
      } else {
        navigate("/citizen/complaints");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <>
        <div className="card">
          <LoadingSpinner label="Loading complaint" size="lg" centered />
        </div>
        <LoadingOverlay loading={true} label="Loading complaint" />
      </>
    );
  if (error) return <p className="error-text">{error}</p>;
  if (!complaint) return <p className="error-text">Complaint not found.</p>;

  const hasCitizenFeedback = Boolean(complaint.citizenRating?.stars || complaint.citizenRating?.review);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Complaint</p>
          <h2>{complaint.title}</h2>
          <p className="muted">Case details and feedback history.</p>
        </div>
        <span className={`badge status-${complaint.status}`}>
          {statusLabelMap[complaint.status] || complaint.status}
        </span>
      </div>

      <div className="card details-card">
        <div className="detail-grid">
          <div>
            <p className="detail-label">Department</p>
            <p>{complaint.departmentId?.name || "Unassigned"}</p>
          </div>
          <div>
            <p className="detail-label">Type</p>
            <p>{complaint.typeId?.name || "General"}</p>
          </div>
          <div>
            <p className="detail-label">Created</p>
            <p>{formatDate(complaint.createdAt)}</p>
          </div>
          <div>
            <p className="detail-label">Resolved</p>
            <p>{formatDate(complaint.departmentResolvedAt)}</p>
          </div>
          <div>
            <p className="detail-label">Expected Resolution Time</p>
            <p>3 to 7 days</p>
          </div>
        </div>
        <div className="detail-block">
          <p className="detail-label">Description</p>
          <p>{complaint.description}</p>
        </div>
        <div className="detail-block">
          <p className="detail-label">Department Notes</p>
          <p>{complaint.departmentNotes || "No notes yet."}</p>
        </div>
        <div className="detail-block">
          <p className="detail-label">Admin Notes</p>
          <p>{complaint.adminNotes || "No notes yet."}</p>
        </div>
        <div className="detail-block">
          <p className="detail-label">Citizen Proofs</p>
          {complaint.citizenProofs?.length ? (
            <div className="proof-grid">
              {complaint.citizenProofs.map((proof) => (
                <a key={proof.publicId} href={proof.url} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No proofs uploaded.</p>
          )}
        </div>
        <div className="detail-block">
          <p className="detail-label">Department Proofs</p>
          {complaint.departmentProofs?.length ? (
            <div className="proof-grid">
              {complaint.departmentProofs.map((proof) => (
                <a key={proof.publicId} href={proof.url} target="_blank" rel="noreferrer">
                  View proof
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No resolution proofs yet.</p>
          )}
        </div>

        {complaint.status === "citizen_verifying" && (
          <div className="detail-block">
            <p className="detail-label">Your Response</p>
            <p className="muted">Choose accept or decline to update the case.</p>
            <button type="button" className="btn btn-primary" onClick={openResponseDialog}>
              Update Response
            </button>
          </div>
        )}
      </div>

      {complaint.status === "accepted" && (
        <div className="card form-card">
          <h3>Citizen Feedback</h3>
          {hasCitizenFeedback ? (
            <>
              <StarDisplay value={complaint.citizenRating.stars} />
              <p className="muted">Rating: {complaint.citizenRating.stars} / 5</p>
              {complaint.citizenRating.review && <p>{complaint.citizenRating.review}</p>}
            </>
          ) : (
            <p className="muted">No citizen feedback was submitted during acceptance.</p>
          )}
        </div>
      )}

      <dialog ref={responseDialogRef} className="modal-dialog" onClose={resetResponseState}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Update Complaint Response</h3>
              <button type="button" className="btn btn-ghost" onClick={closeResponseDialog} disabled={isSubmitting}>
              Close
            </button>
          </div>

          <form className="modal-form" onSubmit={handleResponse}>
            <div className="button-group">
              <button
                type="button"
                className={`btn ${responseMode === "accept" ? "btn-primary" : "btn-outline"}`}
                  disabled={isSubmitting}
                onClick={() => setResponseMode("accept")}
              >
                Accept
              </button>
              <button
                type="button"
                className={`btn ${responseMode === "decline" ? "btn-danger" : "btn-outline"}`}
                  disabled={isSubmitting}
                onClick={() => setResponseMode("decline")}
              >
                Decline
              </button>
            </div>

            {responseMode === "accept" ? (
              <>
                <p className="muted">Accept the resolution. Any uploaded proofs are optional. You may also leave a rating and review.</p>
                <label htmlFor="acceptProofs">Optional proofs</label>
                <input id="acceptProofs" type="file" multiple onChange={(e) => setResponseFiles(Array.from(e.target.files || []))} />

                <label>Rating</label>
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${responseStars >= star ? "active" : ""}`}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      onClick={() => setResponseStars(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label htmlFor="acceptReview">Review</label>
                <textarea
                  id="acceptReview"
                  rows="4"
                  value={responseReview}
                  onChange={(e) => setResponseReview(e.target.value)}
                  placeholder="Optional feedback after acceptance"
                />
              </>
            ) : (
              <>
                <p className="muted">Declining sends the complaint to admin review.</p>
                <label htmlFor="declineReason">Reason *</label>
                <textarea
                  id="declineReason"
                  rows="4"
                  value={responseReason}
                  onChange={(e) => setResponseReason(e.target.value)}
                  required
                />
                <label htmlFor="declineProofs">Proofs <span className="error-text">*</span></label>
                <input id="declineProofs" type="file" multiple required onChange={(e) => setResponseFiles(Array.from(e.target.files || []))} />
              </>
            )}

            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeResponseDialog}>
                Cancel
              </button>
              <button type="submit" className={`btn ${responseMode === "decline" ? "btn-danger" : "btn-primary"}`} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : responseMode === "accept" ? "Accept Resolution" : "Decline & Send Back"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div style={{ marginTop: "32px" }}>
        <Link to="/citizen/complaints" className="btn btn-outline">
          Back to list
        </Link>
      </div>
    </section>
  );
}

export default ComplaintDetailsPage;
