import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getDashboardReport } from "../api";

function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardReport();

      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const summary = report?.summary;

  return (
    <>
      <Navbar title="Reports Dashboard" />

      <div className="dashboard-page">
        <h1>Reports Dashboard</h1>
        <p>View hostel movement summary, high-risk requests, and late returns.</p>

        {loading && <div className="info-message">Loading report...</div>}
        {error && <div className="error-message">{error}</div>}

        {summary && (
          <>
            <div className="report-grid">
              <div className="report-card">
                <span>Total Requests</span>
                <strong>{summary.totalRequests}</strong>
              </div>

              <div className="report-card">
                <span>Student Requested</span>
                <strong>{summary.studentRequested}</strong>
              </div>

              <div className="report-card">
                <span>Parent OTP Sent</span>
                <strong>{summary.parentOtpSent}</strong>
              </div>

              <div className="report-card">
                <span>Parent Approved</span>
                <strong>{summary.parentApproved}</strong>
              </div>

              <div className="report-card">
                <span>QR Generated</span>
                <strong>{summary.qrGenerated}</strong>
              </div>

              <div className="report-card">
                <span>Currently Outside</span>
                <strong>{summary.exited}</strong>
              </div>

              <div className="report-card">
                <span>Returned</span>
                <strong>{summary.returned}</strong>
              </div>

              <div className="report-card">
                <span>Rejected</span>
                <strong>{summary.rejected}</strong>
              </div>

              <div className="report-card">
                <span>Late Returns</span>
                <strong>{summary.lateReturns}</strong>
              </div>

              <div className="report-card">
                <span>High Risk</span>
                <strong>{summary.highRiskRequests}</strong>
              </div>
            </div>

            <section className="report-section">
              <h2>Students Currently Outside</h2>

              {report.studentsCurrentlyOutside.length === 0 ? (
                <p>No students currently outside.</p>
              ) : (
                report.studentsCurrentlyOutside.map((request) => (
                  <div className="small-list-card" key={request._id}>
                    <strong>{request.student?.name}</strong>
                    <p>
                      {request.studentProfile?.collegeId} | Room {request.studentProfile?.roomNumber}
                    </p>
                    <p>{request.destination} - {request.reason}</p>
                  </div>
                ))
              )}
            </section>

            <section className="report-section">
              <h2>Latest High Risk Requests</h2>

              {report.latestHighRiskRequests.length === 0 ? (
                <p>No high-risk requests.</p>
              ) : (
                report.latestHighRiskRequests.map((request) => (
                  <div className="small-list-card" key={request._id}>
                    <strong>{request.student?.name}</strong>
                    <p>{request.aiSummary}</p>
                    <p><strong>Flags:</strong> {request.aiFlags.join(", ")}</p>
                  </div>
                ))
              )}
            </section>

            <section className="report-section">
              <h2>Latest Late Returns</h2>

              {report.latestLateReturns.length === 0 ? (
                <p>No late returns.</p>
              ) : (
                report.latestLateReturns.map((request) => (
                  <div className="small-list-card" key={request._id}>
                    <strong>{request.student?.name}</strong>
                    <p>
                      Late by {request.lateByMinutes} minutes | Destination: {request.destination}
                    </p>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default Reports;