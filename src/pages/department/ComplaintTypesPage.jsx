import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function ComplaintTypesPage() {
  const { currentUser } = useAuth();
  const [types, setTypes] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTypes = () => {
    if (!currentUser?.departmentId) return;
    apiFetch(`/departments/${currentUser.departmentId}/types`)
      .then((data) => setTypes(data.types))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadTypes();
  }, [currentUser?.departmentId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/departments/${currentUser.departmentId}/types`, {
        method: "POST",
        body: { name }
      });
      setName("");
      loadTypes();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (id) => {
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/types/${id}`, {
        method: "PATCH",
        body: { name: editing.name }
      });
      setEditing(null);
      loadTypes();
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
      await apiFetch(`/types/${id}`, { method: "DELETE" });
      loadTypes();
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
          <p className="eyebrow">Department</p>
          <h2>Complaint Types</h2>
          <p className="muted">Maintain the list of complaint categories.</p>
        </div>
      </div>

      <form className="card inline-form" onSubmit={handleAdd}>
        <input
          value={name}
          placeholder="Add a new type"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {isLoading ? (
        <div className="card"><LoadingSpinner label="Loading types" size="lg" /></div>
      ) : (
        <div className="card list-card">
          {types.length === 0 ? (
            <p className="muted">No complaint types added yet.</p>
          ) : (
            types.map((type) => (
              <div key={type._id} className="list-item">
                {editing?.id === type._id ? (
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <span>{type.name}</span>
                )}
                <div className="list-actions">
                  {editing?.id === type._id ? (
                    <>
                      <button type="button" className="btn btn-outline" onClick={() => handleSave(type._id)} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)} disabled={isSaving}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-outline" onClick={() => setEditing({ id: type._id, name: type.name })} disabled={isSaving}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(type._id)} disabled={isSaving}>
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

export default ComplaintTypesPage;
