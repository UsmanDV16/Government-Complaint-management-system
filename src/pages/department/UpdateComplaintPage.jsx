import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UpdateComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, updateComplaint } = useAuth();
  const complaint = complaints.find((c) => c.id === id);
  const [status, setStatus] = useState(complaint?.status || "Pending");
  const [remarks, setRemarks] = useState(complaint?.remarks || "");

  if (!complaint) return <p className="error-text">Complaint not found.</p>;

  const onSubmit = (e) => {
    e.preventDefault();
    updateComplaint(id, { status, remarks });
    navigate("/department/complaints");
  };

  return (
    <section>
      <h2>Update Complaint</h2>
      <form className="card form-card" onSubmit={onSubmit}>
        <p>
          <strong>{complaint.title}</strong>
        </p>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <label htmlFor="remarks">Remarks</label>
        <textarea
          id="remarks"
          rows="4"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Save Update
        </button>
      </form>
    </section>
  );
}

export default UpdateComplaintPage;
