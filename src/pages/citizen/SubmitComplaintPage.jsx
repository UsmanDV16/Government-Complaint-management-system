import { useEffect, useState } from "react";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";

function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    departmentId: "",
    typeId: ""
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiFetch("/departments")
      .then((data) => {
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setForm((prev) => ({ ...prev, departmentId: data.departments[0]._id }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!form.departmentId) return;
    apiFetch(`/departments/${form.departmentId}/types`)
      .then((data) => {
        setTypes(data.types);
        setForm((prev) => ({ ...prev, typeId: data.types[0]?._id || "" }));
      })
      .catch(() => setTypes([]));
  }, [form.departmentId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("departmentId", form.departmentId);
      if (form.typeId) payload.append("typeId", form.typeId);
      files.forEach((file) => payload.append("proofs", file));

      await apiFetch("/complaints", { method: "POST", body: payload });
      navigate("/citizen/complaints");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <LoadingOverlay loading={isLoading} label="Loading departments" />
      <div className="page-header">
        <div>
          <p className="eyebrow">New request</p>
          <h2>Submit a Complaint</h2>
          <p className="muted">Attach evidence and pick the responsible department.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={onSubmit}>
        <label htmlFor="title">Complaint Title</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows="5"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          required
        />
        <div className="form-grid">
          <div>
            <label htmlFor="department">Department</label>
            <select
              id="department"
              value={form.departmentId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, departmentId: e.target.value }))
              }
              required
            >
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type">Complaint Type</label>
            <select
              id="type"
              value={form.typeId}
              onChange={(e) => setForm((prev) => ({ ...prev, typeId: e.target.value }))}
            >
              {types.length === 0 ? (
                <option value="">General</option>
              ) : (
                types.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <label htmlFor="proofs">Proofs (photos, documents)</label>
        <input
          id="proofs"
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <p className="error-text">
          You need to approve/decline the resolution of complaint after department resolves it.
        </p>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </section>
  );
}

export default SubmitComplaintPage;
