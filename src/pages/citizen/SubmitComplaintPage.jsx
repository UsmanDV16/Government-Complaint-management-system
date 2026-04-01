import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SubmitComplaintPage() {
  const navigate = useNavigate();
  const { submitComplaint } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", category: "Water" });

  const onSubmit = (e) => {
    e.preventDefault();
    submitComplaint(form);
    navigate("/citizen/complaints");
  };

  return (
    <section>
      <h2>Submit Complaint</h2>
      <form className="card form-card" onSubmit={onSubmit}>
        <label htmlFor="title">Title</label>
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
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        >
          <option value="Water">Water</option>
          <option value="Roads">Roads</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Electricity">Electricity</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </section>
  );
}

export default SubmitComplaintPage;
