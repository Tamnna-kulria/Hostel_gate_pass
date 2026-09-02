
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllGatePassRequests } from "../api";

function GuardDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllGatePassRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const today = new Date().toDateString();

  const todayExits = requests.filter((request) => {
    if (!request.exitTime) return false;

    return new Date(request.exitTime).toDateString() === today;
  }).length;

  const todayReturns = requests.filter((request) => {
    if (!request.returnTime) return false;

    return new Date(request.returnTime).toDateString() === today;
  }).length;

  const currentlyOutside = requests.filter(
    (request) => request.status === "Exited"
  ).length;

  const lateReturns = requests.filter(
    (request) => request.isLateReturn === true
  ).length;

  return (
    <>
      <Navbar title="Gate Guard Dashboard" />

      <div className="dashboard-page">

        {/* HEADER */}
        <div>
          <h1>Gate Guard Dashboard</h1>

          <p>
            Monitor student gate pass activity and verify student
            exit and return at the hostel gate.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h2>Today's Exits</h2>

            <p className="dashboard-number">
              {loading ? "..." : todayExits}
            </p>

            <p>
              Students who exited today.
            </p>
          </div>

          <div className="dashboard-card">
            <h2>Today's Returns</h2>

            <p className="dashboard-number">
              {loading ? "..." : todayReturns}
            </p>

            <p>
              Students who returned today.
            </p>
          </div>

          <div className="dashboard-card">
            <h2>Currently Outside</h2>

            <p className="dashboard-number">
              {loading ? "..." : currentlyOutside}
            </p>

            <p>
              Students currently outside.
            </p>
          </div>

          <div className="dashboard-card">
            <h2>Late Returns</h2>

            <p className="dashboard-number">
              {loading ? "..." : lateReturns}
            </p>

            <p>
              Students who returned late.
            </p>
          </div>

        </div>

        {/* QR INSTRUCTION */}
        <div
          className="dashboard-card"
          style={{
            marginTop: "24px",
            textAlign: "center"
          }}
        >
          <h2>Gate Pass Verification</h2>

          <p>
            Ask the student to display their approved gate pass QR code.
          </p>

          <p>
            Scan the QR code using the phone camera.
          </p>

          <div
            className="info-message"
            style={{ marginTop: "20px" }}
          >
            After scanning, the student's gate pass details and
            Exit / Return options will automatically appear.
          </div>
        </div>

        {/* STUDENTS CURRENTLY OUTSIDE */}
        <div style={{ marginTop: "30px" }}>

          <h2>Students Currently Outside</h2>

          {loading && (
            <div className="info-message">
              Loading...
            </div>
          )}

          {!loading && currentlyOutside === 0 && (
            <div className="info-message">
              No students are currently outside the hostel.
            </div>
          )}

          {!loading &&
            requests
              .filter((request) => request.status === "Exited")
              .map((request) => (
                <div
                  className="request-card"
                  key={request._id}
                >
                  <div className="request-card-header">

                    <div>
                      <h2>
                        {request.student?.name || "Student"}
                      </h2>

                      <p>
                        College ID:{" "}
                        {request.studentProfile?.collegeId || "N/A"}
                      </p>

                      <p>
                        Room:{" "}
                        {request.studentProfile?.roomNumber || "N/A"}
                      </p>
                    </div>

                    <span className="status-badge exited">
                      Exited
                    </span>

                  </div>

                  <div className="request-details-grid">

                    <p>
                      <strong>Destination:</strong>{" "}
                      {request.destination || "N/A"}
                    </p>

                    <p>
                      <strong>Reason:</strong>{" "}
                      {request.reason || "N/A"}
                    </p>

                    <p>
                      <strong>Expected In:</strong>{" "}
                      {request.indianTimes?.expectedInTime || "N/A"}
                    </p>

                    <p>
                      <strong>Exit Time:</strong>{" "}
                      {request.indianTimes?.exitTime || "N/A"}
                    </p>

                  </div>

                </div>
              ))}

        </div>

      </div>
    </>
  );
}

export default GuardDashboard;

