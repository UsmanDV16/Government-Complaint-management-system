import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function ManageDepartmentsPage() {
  const [name, setName] = useState("");
  const { departments, addDepartment, deleteDepartment } = useAuth();

  const handleAdd = (e) => {
    e.preventDefault();
    addDepartment(name);
    setName("");
  };

  return (
    <section>
      <h2>Manage Departments</h2>
      <form className="card inline-form" onSubmit={handleAdd}>
        <input
          value={name}
          placeholder="Enter department name"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>
      <div className="card list-card">
        {departments.map((dept) => (
          <div key={dept.id} className="list-item">
            <span>{dept.name}</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => deleteDepartment(dept.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManageDepartmentsPage;
