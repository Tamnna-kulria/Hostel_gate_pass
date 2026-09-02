import Navbar from "../components/Navbar";

function GuardDashboard() {
  return (
    <>
      <Navbar title="Gate Guard Dashboard" />

      <div className="dashboard-page">
        <div className="form-card">

          <h1>Gate Guard Dashboard</h1>

          <p>
            Verify student gate passes by scanning the QR code displayed
            by the student.
          </p>

          <div
            className="info-message"
            style={{
              marginTop: "24px",
              padding: "20px",
              textAlign: "center"
            }}
          >
            <h2> Scan Student QR Code</h2>

            <p style={{ marginTop: "10px" }}>
              Ask the student to show their approved gate pass QR code.
            </p>

            <p>
              Scan the QR code using the phone camera.
            </p>

            <p>
              The QR code will automatically open the verification page.
            </p>
          </div>

          <div
            className="result-card"
            style={{ marginTop: "24px" }}
          >
            <h2>Verification Process</h2>

            <div className="request-details-grid">

              <p>
                <strong>Step 1:</strong> Student shows approved QR code.
              </p>

              <p>
                <strong>Step 2:</strong> Guard scans the QR code.
              </p>

              <p>
                <strong>Step 3:</strong> Student's gate pass details appear.
              </p>

              <p>
                <strong>Step 4:</strong> Guard clicks "Mark Exit".
              </p>

              <p>
                <strong>Step 5:</strong> When the student returns, scan the
                same QR code again.
              </p>

              <p>
                <strong>Step 6:</strong> Guard clicks "Mark Return".
              </p>

            </div>
          </div>

          <div
            className="success-message"
            style={{
              marginTop: "24px",
              textAlign: "center"
            }}
          >
            
          </div>

        </div>
      </div>
    </>
  );
}

export default GuardDashboard;