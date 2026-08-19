import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { markStudentExit, markStudentReturn, verifyQrToken } from "../api";

function GuardVerify() {
  const { qrToken } = useParams();
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadQr() {
    try {
      const data = await verifyQrToken(qrToken);
      setRequest(data.request);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadQr();
  }, [qrToken]);

  async function handleExit() {
    const data = await markStudentExit(qrToken);
    setRequest(data.request);
    setMessage(data.message);
  }

  async function handleReturn() {
    const data = await markStudentReturn(qrToken);
    setRequest(data.request);
    setMessage(data.message);
  }

  return (
    <>
      <Navbar title="QR Verification" />
      <div className="form-page">
        <div className="form-card">
          <h1>Gate Pass Verification</h1>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {request && (
            <div className="result-card">
              <p><strong>Status:</strong> {request.status}</p>
              <p><strong>Student:</strong> {request.student?.name}</p>
              <p><strong>College ID:</strong> {request.studentProfile?.collegeId}</p>
              <p><strong>Room:</strong> {request.studentProfile?.roomNumber}</p>
              <p><strong>Destination:</strong> {request.destination}</p>
              <p><strong>Out Time:</strong> {request.indianTimes?.outTime}</p>
              <p><strong>Expected In:</strong> {request.indianTimes?.expectedInTime}</p>

              <div className="action-row">
                <button disabled={request.status !== "QR Generated"} onClick={handleExit}>
                  Mark Exit
                </button>
                <button disabled={request.status !== "Exited"} onClick={handleReturn}>
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

export default GuardVerify;