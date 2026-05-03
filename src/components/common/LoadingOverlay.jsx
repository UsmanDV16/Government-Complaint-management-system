import LoadingSpinner from "./LoadingSpinner";

function LoadingOverlay({ loading, label = "Loading" }) {
  if (!loading) return null;
  return (
    <div className="loading-overlay" aria-hidden={!loading}>
      <div className="loading-overlay-backdrop" />
      <div className="loading-overlay-center">
        <LoadingSpinner label={label} size="lg" />
      </div>
    </div>
  );
}

export default LoadingOverlay;
