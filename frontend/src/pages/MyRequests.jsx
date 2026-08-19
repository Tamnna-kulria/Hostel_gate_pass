import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyGatePassRequests } from "../api";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyGatePassRequests();

      setMessage(data.message);
      setRequests(data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <>
      <Navbar title="My Gate Pass Requests" />

      <div className="dashboard-page">
        <h1>My Requests</h1>
        <p>Track your gate pass request status and approval progress.</p>

        {loading && <div className="info-message">Loading requests...</div>}
        {error && <div className="error-message">{error}</div>}
        {message && !loading && <div className="success-message">{message}</div>}

        <div className="request-list">
          {requests.map((request) => (
            <div className="request-card" key={request._id}>
              <div className="request-card-header">
                <div>
                  <h2>{request.destination}</h2>
                  <p>{request.reason}</p>
                </div>

                <span className={`status-badge ${request.status.replaceAll(" ", "-").toLowerCase()}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-details-grid">
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
                <div className="mini-section qr-section">
                    <strong>Gate Pass QR Code:</strong>

                    <div className="qr-box">
                    <QRCodeCanvas
                        value={`http://localhost:5173/guard/verify/${request.qrToken}`}
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                    </div>

                    <p>http://localhost:5173/guard/verify/{request.qrToken}</p>
                </div>
                )}
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

export default MyRequests;