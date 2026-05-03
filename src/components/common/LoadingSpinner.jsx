function LoadingSpinner({ label = "Loading", size = "md", centered = false }) {
  return (
    <div
      className={`loading-state loading-state-${size} ${centered ? "loading-state-centered" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;