import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
function AdminDashboard() {
  return (
    <>
      <Navbar title="Admin Dashboard" />

      <div className="dashboard-page">
        <h1>Admin Dashboard</h1>
        <p>Here admin will manage students, staff, rules, and reports.</p>

        <div className="dashboard-grid">
          <Link to="/admin/students" className="dashboard-card card-link">
              <h2>Students</h2>
              <p>Add and update student hostel profiles.</p>
            </Link>
          <div className="dashboard-card">
            <h2>Hostel Rules</h2>
            <p>Set outing timings, limits, and permissions.</p>
          </div>

  
          <Link to="/warden-dashboard" className="dashboard-card card-link">
              <h2>Gate Pass Requests</h2>
              <p>Approve, reject, and review requests.</p>
            </Link>

            <Link to="/reports" className="dashboard-card card-link">
              <h2>Reports</h2>
              <p>View movement, late returns, and high-risk requests.</p>
            </Link>

            <Link to="/audit-logs" className="dashboard-card card-link">
              <h2>Audit Logs</h2>
              <p>Track every important action.</p>
            </Link>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;