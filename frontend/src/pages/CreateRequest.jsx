import { useState } from "react";
import Navbar from "../components/Navbar";
import { createGatePassRequest } from "../api";

function CreateRequest() {
  const [formData, setFormData] = useState({
    goingDate: "",
    destination: "",
    reason: "",
    leaveDays: 1,
    goingWith: "Own Responsibility",
    luggageDetails: "",
    outTime: "",
    expectedInTime: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdRequest, setCreatedRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setCreatedRequest(null);

      const data = await createGatePassRequest({
        ...formData,
        leaveDays: Number(formData.leaveDays)
      });

      setMessage(data.message);
      setCreatedRequest(data.request);

      setFormData({
        goingDate: "",
        destination: "",
        reason: "",
        leaveDays: 1,
        goingWith: "Own Responsibility",
        luggageDetails: "",
        outTime: "",
        expectedInTime: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar title="Create Gate Pass Request" />

      <div className="form-page">
        <div className="form-card">
          <h1>Create Gate Pass Request</h1>
          <p>Fill your leave details. Parent email verification will happen after submission.</p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>Date When To Go</label>
            <input
              type="date"
              name="goingDate"
              value={formData.goingDate}
              onChange={handleChange}
              required
            />

            <label>Where To Go</label>
            <input
              type="text"
              name="destination"
              placeholder="Example: Home, market, hospital"
              value={formData.destination}
              onChange={handleChange}
              required
            />

            <label>Reason</label>
            <textarea
              name="reason"
              placeholder="Write your reason clearly"
              value={formData.reason}
              onChange={handleChange}
              required
            ></textarea>

            <label>Leave For Number Of Days</label>
            <input
              type="number"
              name="leaveDays"
              min="1"
              value={formData.leaveDays}
              onChange={handleChange}
              required
            />

            <label>Going With</label>
            <select
              name="goingWith"
              value={formData.goingWith}
              onChange={handleChange}
              required
            >
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Friend">Friend</option>
              <option value="Relative">Relative</option>
              <option value="Own Responsibility">Own Responsibility</option>
            </select>

            <label>Luggage If Any</label>
            <input
              type="text"
              name="luggageDetails"
              placeholder="Example: No luggage, one suitcase"
              value={formData.luggageDetails}
              onChange={handleChange}
            />

            <label>Out Time</label>
            <input
              type="datetime-local"
              name="outTime"
              value={formData.outTime}
              onChange={handleChange}
              required
            />

            <label>Expected In Time</label>
            <input
              type="datetime-local"
              name="expectedInTime"
              value={formData.expectedInTime}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>

          {createdRequest && (
            <div className="result-card">
              <h2>Request Created</h2>
              <p><strong>Status:</strong> {createdRequest.status}</p>
              <p><strong>AI Risk:</strong> {createdRequest.aiRiskLevel}</p>
              <p><strong>AI Summary:</strong> {createdRequest.aiSummary}</p>

              {createdRequest.aiFlags?.length > 0 && (
                <>
                  <p><strong>AI Flags:</strong></p>
                  <ul>
                    {createdRequest.aiFlags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </>
              )}

              <p><strong>Created At:</strong> {createdRequest.indianTimes?.createdAt}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CreateRequest;