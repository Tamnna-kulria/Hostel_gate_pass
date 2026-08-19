import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getAllGatePassRequests,
  rejectGatePassRequest,
  wardenApproveGatePass
} from "../api";

function WardenDashboard() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllGatePassRequests();

      setRequests(data.requests);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleApprove(requestId) {
    const wardenRemark = window.prompt(
      "Enter warden remark",
      "Approved. Student may leave as per schedule."
    );

    if (wardenRemark === null) {
      return;
    }

    try {
      setActionLoadingId(requestId);
      setError("");

      const data = await wardenApproveGatePass(requestId, wardenRemark);

      setMessage(data.message);
      await loadRequests();

      if (data.qrCodeImage) {
        const qrWindow = window.open("");
        qrWindow.document.write(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 30px;">
              <h2>Gate Pass QR Code</h2>
              <img src="${data.qrCodeImage}" alt="QR Code" />
              <p>${data.qrVerificationUrl}</p>
            </body>
          </html>
        `);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleReject(requestId) {
    const rejectReason = window.prompt("Enter reject reason");

    if (!rejectReason) {
      return;
    }

    try {
      setActionLoadingId(requestId);
      setError("");

      const data = await rejectGatePassRequest(requestId, rejectReason);

      setMessage(data.message);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <>
      <Navbar title="Warden Dashboard" />

      <div className="dashboard-page">
        <h1>Warden Dashboard</h1>
        <p>Review parent-approved requests, AI risk alerts, and approval status.</p>

        {loading && <div className="info-message">Loading requests...</div>}
        {error && <div className="error-message">{error}</div>}
        {message && !loading && <div className="success-message">{message}</div>}

        <div className="request-list">
          {requests.map((request) => (
            <div className="request-card" key={request._id}>
              <div className="request-card-header">
                <div>
                  <h2>{request.student?.name || "Student"}</h2>
                  <p>
                    {request.studentProfile?.collegeId} | Room {request.studentProfile?.roomNumber}
                  </p>
                  <p>{request.destination} - {request.reason}</p>
                </div>

                <span className={`status-badge ${request.status.replaceAll(" ", "-").toLowerCase()}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-details-grid">
                <p><strong>Branch:</strong> {request.studentProfile?.branch}</p>
                <p><strong>Year:</strong> {request.studentProfile?.year}</p>
                <p><strong>Father:</strong> {request.studentProfile?.fatherName}</p>
                <p><strong>Parent Email:</strong> {request.studentProfile?.parentEmail}</p>
                <p><strong>Going Date:</strong> {request.indianTimes?.goingDate}</p>
                <p><strong>Out Time:</strong> {request.indianTimes?.outTime}</p>
                <p><strong>Expected In:</strong> {request.indianTimes?.expectedInTime}</p>
                <p><strong>Leave Days:</strong> {request.leaveDays}</p>
                <p><strong>Going With:</strong> {request.goingWith}</p>
                <p><strong>Luggage:</strong> {request.luggageDetails}</p>
                <p><strong>AI Risk:</strong> {request.aiRiskLevel}</p>
                <p><strong>Created:</strong> {request.indianTimes?.createdAt}</p>
              </div>

              {request.aiSummary && (
                <div className="mini-section">
                  <strong>AI Summary:</strong>
                  <p>{request.aiSummary}</p>
                </div>
              )}

              {request.aiFlags?.length > 0 && (
                <div className="mini-section">
                  <strong>AI Flags:</strong>
                  <ul>
                    {request.aiFlags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {request.qrToken && (
                <div className="mini-section">
                  <strong>QR Link:</strong>
                  <p>http://localhost:5173/guard/verify/{request.qrToken}</p>
                </div>
              )}

              <div className="action-row">
                <button
                  onClick={() => handleApprove(request._id)}
                  disabled={
                    actionLoadingId === request._id ||
                    request.status !== "Parent Approved"
                  }
                >
                  {actionLoadingId === request._id ? "Processing..." : "Approve & Generate QR"}
                </button>

                <button
                  className="danger-button"
                  onClick={() => handleReject(request._id)}
                  disabled={
                    actionLoadingId === request._id ||
                    ["Exited", "Returned", "Rejected", "Expired"].includes(request.status)
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <div className="info-message">No gate pass requests found.</div>
        )}
      </div>
    </>
  );
}

export default WardenDashboard;