function StatCard({ title, value }) {
  return (
    <div className="card stat-card">
      <p className="muted">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  );
}

export default StatCard;
