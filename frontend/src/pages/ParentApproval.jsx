import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getParentApprovalRequest,
  parentApproveByToken,
  parentRejectByToken,
  verifyParentOtpByToken
} from "../api";

function ParentApproval() {
  const { parentToken } = useParams();

  const [request, setRequest] = useState(null);
  const [otp, setOtp] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequest() {
    try {
      setLoading(true);
      setError("");

      const data = await getParentApprovalRequest(parentToken);
      setRequest(data.request);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequest();
  }, [parentToken]);

  async function handleVerifyOtp(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await verifyParentOtpByToken(parentToken, otp);
        setRequest(data.request);
        setMessage(data.message);
        setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    try {
      setLoading(true);
      setError("");

      const data = await parentApproveByToken(parentToken);
      setRequest(data.request);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    try {
      setLoading(true);
      setError("");

      const data = await parentRejectByToken(parentToken, rejectReason);
      setRequest(data.request);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Parent Gate Pass Approval</h1>
        <p>Please verify OTP from email before approving or rejecting.</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {request && (
          <div className="result-card">
            <h2>{request.student?.name}</h2>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>College ID:</strong> {request.studentProfile?.collegeId}</p>
            <p><strong>Destination:</strong> {request.destination}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <p><strong>Leave Days:</strong> {request.leaveDays}</p>
            <p><strong>Out Time:</strong> {request.indianTimes?.outTime}</p>
            <p><strong>Expected In:</strong> {request.indianTimes?.expectedInTime}</p>
          </div>
        )}

       {request?.status === "Parent OTP Sent" && (
        <form onSubmit={handleVerifyOtp}>
            <label>Enter OTP From Email</label>
            <input
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter OTP"
            required
            />
            <button disabled={loading}>Verify OTP</button>
        </form>
        )}

        {request?.status === "Parent Verified" && (
        <div className="success-message">
            OTP verified successfully. You can now approve or reject this request.
        </div>
        )}

        <button
          onClick={handleApprove}
          disabled={loading || request?.status !== "Parent Verified"}
        >
          Approve Gate Pass
        </button>

        <div className="mini-section">
          <label>Reject Reason</label>
          <input
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Enter reason if rejecting"
          />
          <button
            className="danger-button"
            onClick={handleReject}
            disabled={loading || !["Parent OTP Sent", "Parent Verified"].includes(request?.status)}
          >
            Reject Gate Pass
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParentApproval;