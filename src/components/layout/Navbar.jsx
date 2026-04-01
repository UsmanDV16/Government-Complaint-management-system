import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <h1>Government Complaint Management</h1>
      {currentUser && (
        <div className="navbar-user">
          <span>
            {currentUser.name} ({currentUser.role})
          </span>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
