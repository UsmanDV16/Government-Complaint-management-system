import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-mark">GC</div>
        <div>
          <h1>Gov Complaint Desk</h1>
          <p className="muted">National service portal</p>
        </div>
      </div>
      {currentUser && (
        <div className="navbar-user">
          <div>
            <p className="user-name">{currentUser.name}</p>
            <p className="muted">{currentUser.role}</p>
          </div>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
