import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { formatDate, statusLabelMap } from "../../utils/complaints";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function CitizenVerifyPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/complaints/${id}`)
      .then((data) => setComplaint(data.complaint))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingSpinner centered />;
  if (error && !complaint) return <p className="error-text">{error}</p>;
  if (!complaint) return <p className="error-text">Complaint not found.</p>;

  return <Navigate to={`/citizen/complaints/${id}`} replace />;
}

export default CitizenVerifyPage;
