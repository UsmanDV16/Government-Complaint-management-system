import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function ManageUsersPage() {
  const [departments, setDepartments] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [citizenQuery, setCitizenQuery] = useState("");
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [hasSearchedCitizens, setHasSearchedCitizens] = useState(false);
  const [hasSearchedDepartmentUsers, setHasSearchedDepartmentUsers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState({ citizen: false, department: false });
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    cnic: "",
    email: "",
    password: "",
    departmentId: ""
  });
  const [error, setError] = useState("");
  const createDialogRef = useRef(null);
  const departmentDialogRef = useRef(null);
  const citizensDialogRef = useRef(null);

  const loadDepartments = () => {
    apiFetch("/departments")
      .then((deptRes) => {
        setDepartments(deptRes.departments);
        if (!form.departmentId && deptRes.departments[0]?._id) {
          setForm((prev) => ({ ...prev, departmentId: deptRes.departments[0]._id }));
        }
      })
      .catch((err) => setError(err.message));
  };

  const searchUsers = async (role, query) => {
    const q = query.trim();
    if (!q) {
      if (role === "citizen") {
        setCitizens([]);
        setHasSearchedCitizens(false);
      } else {
        setDepartmentUsers([]);
        setHasSearchedDepartmentUsers(false);
      }
      return;
    }

    setError("");
    setIsLoadingUsers((prev) => ({ ...prev, [role]: true }));
    const data = await apiFetch(`/users?role=${role}&q=${encodeURIComponent(q)}`);
    if (role === "citizen") {
      setCitizens(data.users);
      setHasSearchedCitizens(true);
    } else {
      setDepartmentUsers(data.users);
      setHasSearchedDepartmentUsers(true);
    }
    setIsLoadingUsers((prev) => ({ ...prev, [role]: false }));
  };

  const showAllUsers = async (role) => {
    setError("");
    setIsLoadingUsers((prev) => ({ ...prev, [role]: true }));
    const data = await apiFetch(`/users?role=${role}`);
    if (role === "citizen") {
      setCitizens(data.users);
      setHasSearchedCitizens(true);
    } else {
      setDepartmentUsers(data.users);
      setHasSearchedDepartmentUsers(true);
    }
    setIsLoadingUsers((prev) => ({ ...prev, [role]: false }));
  };

  const refreshSearchResults = async () => {
    try {
      if (hasSearchedCitizens && citizenQuery.trim()) {
        await searchUsers("citizen", citizenQuery);
      }
      if (hasSearchedDepartmentUsers && departmentQuery.trim()) {
        await searchUsers("department", departmentQuery);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getDepartmentName = (id) =>
    departments.find((dept) => dept._id === id)?.name || "No department";

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: form
      });
      setForm({
        name: "",
        username: "",
        cnic: "",
        email: "",
        password: "",
        departmentId: form.departmentId
      });
      refreshSearchResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditing({
      id: user.id,
      role: user.role,
      name: user.name,
      username: user.username || "",
      cnic: user.cnic,
      email: user.email || "",
      departmentId: user.departmentId || "",
      password: ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const payload = {
        name: editing.name,
        username: editing.username || null,
        cnic: editing.cnic,
        email: editing.email || null
      };
      if (editing.role === "department") {
        payload.departmentId = editing.departmentId || null;
      }
      if (editing.password) {
        payload.password = editing.password;
      }
      await apiFetch(`/users/${editing.id}`, {
        method: "PATCH",
        body: payload
      });
      setEditing(null);
      refreshSearchResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (user) => {
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/users/${user.id}`, {
        method: "PATCH",
        body: { isActive: !user.isActive }
      });
      refreshSearchResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user) => {
    setError("");
    setIsSaving(true);
    try {
      await apiFetch(`/users/${user.id}`, { method: "DELETE" });
      refreshSearchResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCitizenSearch = async (e) => {
    e.preventDefault();
    try {
      await searchUsers("citizen", citizenQuery);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDepartmentSearch = async (e) => {
    e.preventDefault();
    try {
      await searchUsers("department", departmentQuery);
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (modal) => {
    if (modal === "create") {
      createDialogRef.current?.showModal();
    } else if (modal === "department") {
      departmentDialogRef.current?.showModal();
    } else if (modal === "citizens") {
      citizensDialogRef.current?.showModal();
    }
  };

  const closeModal = (modal) => {
    if (modal === "create") {
      createDialogRef.current?.close();
      setEditing(null);
    } else if (modal === "department") {
      departmentDialogRef.current?.close();
    } else if (modal === "citizens") {
      citizensDialogRef.current?.close();
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Manage Users</h2>
          <p className="muted">Create department accounts and manage access.</p>
        </div>
      </div>

      {/* Main Options */}
      <div className="grid-3">
        <div className="card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Create User</h3>
            <p className="muted" style={{ marginBottom: "1.5rem" }}>
              Add a new department staff member
            </p>
            <button
              className="btn btn-primary"
              onClick={() => openModal("create")}
              style={{ width: "100%" }}
            >
              Create New User
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Department Users</h3>
            <p className="muted" style={{ marginBottom: "1.5rem" }}>
              Search and manage department staff
            </p>
            <button
              className="btn btn-primary"
              onClick={() => openModal("department")}
              style={{ width: "100%" }}
            >
              Manage Department Users
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Citizens</h3>
            <p className="muted" style={{ marginBottom: "1.5rem" }}>
              Search and manage citizen accounts
            </p>
            <button
              className="btn btn-primary"
              onClick={() => openModal("citizens")}
              style={{ width: "100%" }}
            >
              Manage Citizens
            </button>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <dialog ref={createDialogRef} className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create Department User</h3>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => closeModal("create")}
            >
              ✕
            </button>
          </div>

          {!editing ? (
            <form className="modal-form" onSubmit={handleCreate}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <label htmlFor="cnic">CNIC</label>
              <input
                id="cnic"
                value={form.cnic}
                onChange={(e) => setForm((prev) => ({ ...prev, cnic: e.target.value }))}
                required
              />
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <label htmlFor="password">Temporary Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={form.departmentId}
                onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                required
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {error && <p className="error-text">{error}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => closeModal("create")}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form className="modal-form" onSubmit={handleUpdate}>
              <label htmlFor="edit-name">Full Name</label>
              <input
                id="edit-name"
                value={editing.name}
                onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              {editing.role !== "citizen" && (
                <>
                  <label htmlFor="edit-username">Username</label>
                  <input
                    id="edit-username"
                    value={editing.username}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, username: e.target.value }))
                    }
                    required
                  />
                </>
              )}
              <label htmlFor="edit-cnic">CNIC</label>
              <input
                id="edit-cnic"
                value={editing.cnic}
                onChange={(e) => setEditing((prev) => ({ ...prev, cnic: e.target.value }))}
                required
              />
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                value={editing.email}
                onChange={(e) => setEditing((prev) => ({ ...prev, email: e.target.value }))}
              />
              {editing.role === "department" && (
                <>
                  <label htmlFor="edit-department">Department</label>
                  <select
                    id="edit-department"
                    value={editing.departmentId}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, departmentId: e.target.value }))
                    }
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <label htmlFor="edit-password">New Password (optional)</label>
              <input
                id="edit-password"
                type="password"
                value={editing.password}
                onChange={(e) => setEditing((prev) => ({ ...prev, password: e.target.value }))}
              />
              {error && <p className="error-text">{error}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      {/* Department Users Dialog */}
      <dialog ref={departmentDialogRef} className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Manage Department Users</h3>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => closeModal("department")}
            >
              ✕
            </button>
          </div>

          {!editing ? (
            <div className="modal-form">
              <form className="inline-form" onSubmit={handleDepartmentSearch}>
                <input
                  value={departmentQuery}
                  onChange={(e) => setDepartmentQuery(e.target.value)}
                  placeholder="Search by username, CNIC, name, or email"
                />
                <div className="inline-actions">
                  <button type="submit" className="btn btn-outline">
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => showAllUsers("department")}
                  >
                    Show All
                  </button>
                </div>
              </form>
              {isLoadingUsers.department && <LoadingSpinner label="Loading department users" size="sm" />}
              {!hasSearchedDepartmentUsers ? (
                <p className="muted">Search to view department users.</p>
              ) : departmentUsers.length === 0 ? (
                <p className="muted">No department users found.</p>
              ) : (
                <div className="list-container">
                  {departmentUsers.map((user) => (
                    <div key={user.id} className="list-item">
                      <div>
                        <strong>{user.name}</strong>
                        <p className="muted">{user.username || "No username"}</p>
                        <p className="muted">{user.cnic}</p>
                        <p className="muted">{getDepartmentName(user.departmentId)}</p>
                      </div>
                      <div className="list-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => startEdit(user)}
                          disabled={isSaving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleToggle(user)}
                          disabled={isSaving}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(user)}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form className="modal-form" onSubmit={handleUpdate}>
              <label htmlFor="edit-name-dept">Full Name</label>
              <input
                id="edit-name-dept"
                value={editing.name}
                onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <label htmlFor="edit-username-dept">Username</label>
              <input
                id="edit-username-dept"
                value={editing.username}
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, username: e.target.value }))
                }
                required
              />
              <label htmlFor="edit-cnic-dept">CNIC</label>
              <input
                id="edit-cnic-dept"
                value={editing.cnic}
                onChange={(e) => setEditing((prev) => ({ ...prev, cnic: e.target.value }))}
                required
              />
              <label htmlFor="edit-email-dept">Email</label>
              <input
                id="edit-email-dept"
                type="email"
                value={editing.email}
                onChange={(e) => setEditing((prev) => ({ ...prev, email: e.target.value }))}
              />
              <label htmlFor="edit-department-dept">Department</label>
              <select
                id="edit-department-dept"
                value={editing.departmentId}
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, departmentId: e.target.value }))
                }
                required
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <label htmlFor="edit-password-dept">New Password (optional)</label>
              <input
                id="edit-password-dept"
                type="password"
                value={editing.password}
                onChange={(e) => setEditing((prev) => ({ ...prev, password: e.target.value }))}
              />
              {error && <p className="error-text">{error}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      {/* Citizens Dialog */}
      <dialog ref={citizensDialogRef} className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Manage Citizens</h3>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => closeModal("citizens")}
            >
              ✕
            </button>
          </div>

          {!editing ? (
            <div className="modal-form">
              <form className="inline-form" onSubmit={handleCitizenSearch}>
                <input
                  value={citizenQuery}
                  onChange={(e) => setCitizenQuery(e.target.value)}
                  placeholder="Search by CNIC, name, or email"
                />
                <div className="inline-actions">
                  <button type="submit" className="btn btn-outline">
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => showAllUsers("citizen")}
                  >
                    Show All
                  </button>
                </div>
              </form>
              {isLoadingUsers.citizen && <LoadingSpinner label="Loading citizens" size="sm" />}
              {!hasSearchedCitizens ? (
                <p className="muted">Search to view citizens.</p>
              ) : citizens.length === 0 ? (
                <p className="muted">No citizens found.</p>
              ) : (
                <div className="list-container">
                  {citizens.map((user) => (
                    <div key={user.id} className="list-item">
                      <div>
                        <strong>{user.name}</strong>
                        <p className="muted">{user.cnic}</p>
                        <p className="muted">{user.email}</p>
                      </div>
                      <div className="list-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => startEdit(user)}
                          disabled={isSaving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleToggle(user)}
                          disabled={isSaving}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(user)}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form className="modal-form" onSubmit={handleUpdate}>
              <label htmlFor="edit-name-cit">Full Name</label>
              <input
                id="edit-name-cit"
                value={editing.name}
                onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <label htmlFor="edit-cnic-cit">CNIC</label>
              <input
                id="edit-cnic-cit"
                value={editing.cnic}
                onChange={(e) => setEditing((prev) => ({ ...prev, cnic: e.target.value }))}
                required
              />
              <label htmlFor="edit-email-cit">Email</label>
              <input
                id="edit-email-cit"
                type="email"
                value={editing.email}
                onChange={(e) => setEditing((prev) => ({ ...prev, email: e.target.value }))}
              />
              <label htmlFor="edit-password-cit">New Password (optional)</label>
              <input
                id="edit-password-cit"
                type="password"
                value={editing.password}
                onChange={(e) => setEditing((prev) => ({ ...prev, password: e.target.value }))}
              />
              {error && <p className="error-text">{error}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </section>
  );
}

export default ManageUsersPage;
