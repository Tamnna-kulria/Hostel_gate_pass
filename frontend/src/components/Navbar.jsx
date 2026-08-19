import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api";

function Navbar({ title }) {
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="navbar">
      <h2>{title}</h2>

      <div className="nav-links">
        <Link to="/student-dashboard">Student</Link>
        <Link to="/warden-dashboard">Warden</Link>
        <Link to="/guard-dashboard">Guard</Link>
        <Link to="/admin-dashboard">Admin</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/audit-logs">Audit</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;