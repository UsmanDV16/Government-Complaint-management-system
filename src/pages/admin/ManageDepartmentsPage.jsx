import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiFetch } from "../../api/client";

function ManageDepartmentsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDepartments = () => {
    apiFetch("/departments")
      .then((data) => setDepartments(data.departments))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await apiFetch("/departments", {
        method: "POST",
        body: { name, description }
      });
      setName("");
      setDescription("");
      loadDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (dept) => {
    setEditing({
      id: dept._id,
      name: dept.name,
      description: dept.description || ""
    });
  };

  const handleSave = async () => {
    if (!editing?.name?.trim()) { setError("Department name is required."); return; }
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/departments/${editing.id}`, {
        method: "PATCH",
        body: { name: editing.name, description: editing.description }
      });
      setEditing(null);
      loadDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (dept) => {
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/departments/${dept._id}`, {
        method: "PATCH",
        body: { isActive: !dept.isActive }
      });
      loadDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/departments/${id}`, { method: "DELETE" });
      loadDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Manage Departments</h2>
          <p className="muted">Create and maintain departmental ownership.</p>
        </div>
      </div>
      <form className="card inline-form" onSubmit={handleAdd}>
        <div className="inline-form-fields">
          <input
            value={name}
            placeholder="Enter department name"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            value={description}
            placeholder="Description (optional)"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {isLoading ? (
        <div className="card"><LoadingSpinner label="Loading departments" size="lg" /></div>
      ) : (
      <div className="card list-card">
        {departments.length === 0 ? (
          <p className="muted">No departments found.</p>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} className="list-item">
              <div className="list-item-body">
                {editing?.id === dept._id ? (
                  <div className="list-item-edit">
                    <input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                    <input
                      value={editing.description}
                      onChange={(e) =>
                        setEditing((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <div>
                    <strong>{dept.name}</strong>
                    <p className="muted">{dept.description || "No description"}</p>
                    <span className={`pill ${dept.isActive ? "pill-active" : "pill-muted"}`}>
                      {dept.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
              <div className="list-actions">
                {editing?.id === dept._id ? (
                  <>
                    <button type="button" className="btn btn-outline" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)} disabled={isSaving}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-outline" onClick={() => startEdit(dept)} disabled={isSaving}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleToggle(dept)} disabled={isSaving}>
                      {dept.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(dept._id)} disabled={isSaving}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </section>
  );
}

export default ManageDepartmentsPage;
