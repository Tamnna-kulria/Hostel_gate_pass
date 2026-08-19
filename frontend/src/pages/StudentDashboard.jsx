import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";


function StudentDashboard() {
  return (
    <>
      <Navbar title="Student Dashboard" />

      <div className="dashboard-page">
        <h1>Student Dashboard</h1>
        <p>Here student will create and track gate pass requests.</p>

        <div className="dashboard-grid">

        <Link to="/student/create-request" className="dashboard-card card-link">
            <h2>Create Request</h2>
            <p>Apply for a hostel gate pass.</p>
        </Link>

          <Link to="/student/my-requests" className="dashboard-card card-link">
            <h2>My Requests</h2>
            <p>Track pending, approved, and rejected requests.</p>
        </Link>

         <Link to="/student/profile" className="dashboard-card card-link">
            <h2>My Profile</h2>
            <p>View college ID, room number, and parent details.</p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;