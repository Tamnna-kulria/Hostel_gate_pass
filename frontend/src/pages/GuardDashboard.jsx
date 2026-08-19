import { useState } from "react";
import Navbar from "../components/Navbar";
import {
  markStudentExit,
  markStudentReturn,
  verifyQrToken
} from "../api";

function GuardDashboard() {
  const [qrInput, setQrInput] = useState("");
  const [verifiedRequest, setVerifiedRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function extractQrToken(value) {
    if (value.includes("/guard/verify/")) {
      return value.split("/guard/verify/")[1];
    }

    return value.trim();
  }

  async function handleVerify(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setVerifiedRequest(null);

      const qrToken = extractQrToken(qrInput);
      const data = await verifyQrToken(qrToken);

      setMessage(data.message);
      setVerifiedRequest(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExit() {
    try {
      setLoading(true);
      setError("");

      const qrToken = extractQrToken(qrInput);
      const data = await markStudentExit(qrToken);

      setMessage(data.message);
      setVerifiedRequest(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn() {
    try {
      setLoading(true);
      setError("");

      const qrToken = extractQrToken(qrInput);
      const data = await markStudentReturn(qrToken);

      setMessage(data.message);
      setVerifiedRequest(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar title="Gate Guard Dashboard" />

      <div className="form-page">
        <div className="form-card">
          <h1>Verify Gate Pass QR</h1>
          <p>Paste QR token or full QR verification link.</p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleVerify}>
            <label>QR Token / Verification Link</label>
            <input
              type="text"
              placeholder="Paste QR token or http://localhost:5173/guard/verify/..."
              value={qrInput}
              onChange={(event) => setQrInput(event.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Verify QR"}
            </button>
          </form>

          {verifiedRequest && (
            <div className="result-card">
              <h2>Gate Pass Details</h2>

              <div className="request-details-grid">
                <p><strong>Status:</strong> {verifiedRequest.status}</p>
                <p><strong>Student:</strong> {verifiedRequest.student?.name}</p>
                <p><strong>College ID:</strong> {verifiedRequest.studentProfile?.collegeId}</p>
                <p><strong>Room:</strong> {verifiedRequest.studentProfile?.roomNumber}</p>
                <p><strong>Destination:</strong> {verifiedRequest.destination}</p>
                <p><strong>Reason:</strong> {verifiedRequest.reason}</p>
                <p><strong>Out Time:</strong> {verifiedRequest.indianTimes?.outTime}</p>
                <p><strong>Expected In:</strong> {verifiedRequest.indianTimes?.expectedInTime}</p>
                <p><strong>Exit Time:</strong> {verifiedRequest.indianTimes?.exitTime || "Not exited yet"}</p>
                <p><strong>Return Time:</strong> {verifiedRequest.indianTimes?.returnTime || "Not returned yet"}</p>
                <p><strong>Late Return:</strong> {verifiedRequest.isLateReturn ? "Yes" : "No"}</p>
                <p><strong>Late By:</strong> {verifiedRequest.lateByMinutes} minutes</p>
              </div>

              <div className="action-row">
                <button
                  onClick={handleExit}
                  disabled={loading || verifiedRequest.status !== "QR Generated"}
                >
                  Mark Exit
                </button>

                <button
                  onClick={handleReturn}
                  disabled={loading || verifiedRequest.status !== "Exited"}
                >
                  Mark Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GuardDashboard;