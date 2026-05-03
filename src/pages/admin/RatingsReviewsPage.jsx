import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/complaints";

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

function RatingsReviewsPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/complaints"), apiFetch("/departments")])
      .then(([complaintsRes, departmentsRes]) => {
        setComplaints(complaintsRes.complaints || []);
        setDepartments(departmentsRes.departments || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const feedbackRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return complaints
      .filter((complaint) => complaint.citizenRating?.stars)
      .filter((complaint) => {
        if (!normalized) return true;
        const haystack = [
          complaint.citizenId?.name,
          complaint.citizenId?.cnic,
          complaint.citizenRating?.review,
          complaint.departmentId?.name,
          complaint.title
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .sort((left, right) => new Date(right.citizenRating.updatedAt || right.updatedAt) - new Date(left.citizenRating.updatedAt || left.updatedAt));
  }, [complaints, query]);

  const departmentsWithFeedback = useMemo(() => {
    return departments
      .map((department) => {
        const departmentRows = feedbackRows.filter((complaint) => complaint.departmentId?._id === department._id);
        const ratingTotal = departmentRows.reduce((sum, complaint) => sum + Number(complaint.citizenRating?.stars || 0), 0);
        return {
          ...department,
          rows: departmentRows,
          average: departmentRows.length ? (ratingTotal / departmentRows.length).toFixed(1) : "0.0"
        };
      })
  }, [departments, feedbackRows]);

  if (isLoading) {
    return <LoadingSpinner label="Loading feedback" size="lg" centered />;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Ratings & Reviews</h2>
          <p className="muted">Citizen feedback grouped by department and searchable by citizen name, CNIC, or review text.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card form-card">
        <label htmlFor="feedbackSearch">Search feedback</label>
        <input
          id="feedbackSearch"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by citizen name, CNIC, or review content"
        />
      </div>

      {departmentsWithFeedback.map((department) => (
        <div key={department._id} className="card form-card">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <h3>{department.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                {department.rows.length > 0 ? (
                  <>
                    <StarDisplay value={parseFloat(department.average)} />
                    <span className="muted">{department.average} / 5 &middot; {department.rows.length} review{department.rows.length === 1 ? "" : "s"}</span>
                  </>
                ) : (
                  <span className="muted">No reviews yet</span>
                )}
              </div>
            </div>
          </div>

          <div className="stack-list">
            {department.rows.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.875rem" }}>No citizen ratings for this department.</p>
            ) : department.rows.map((complaint) => (
              <article key={complaint._id} className="card" style={{ padding: 16 }}>
                <div className="detail-grid">
                  <div>
                    <p className="detail-label">Citizen</p>
                    <p>{complaint.citizenId?.name || "-"}</p>
                    <p className="muted">CNIC: {complaint.citizenId?.cnic || "-"}</p>
                  </div>
                  <div>
                    <p className="detail-label">Complaint</p>
                    <p>{complaint.title}</p>
                  </div>
                  <div>
                    <p className="detail-label">Rating</p>
                    <StarDisplay value={complaint.citizenRating.stars} />
                    <p className="muted">{complaint.citizenRating.stars} / 5</p>
                  </div>
                  <div>
                    <p className="detail-label">Updated</p>
                    <p>{formatDate(complaint.citizenRating.updatedAt || complaint.updatedAt)}</p>
                  </div>
                </div>
                <div className="detail-block">
                  <p className="detail-label">Review</p>
                  <p>{complaint.citizenRating.review || "No written review."}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

    </section>
  );
}

export default RatingsReviewsPage;