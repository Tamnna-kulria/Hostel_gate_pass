import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAuditLogs } from "../api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then((data) => setLogs(data.logs))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <Navbar title="Audit Logs" />
      <div className="dashboard-page">
        <h1>Audit Logs</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="request-list">
          {logs.map((log) => (
            <div className="request-card" key={log._id}>
              <h2>{log.action}</h2>
              <p><strong>Actor:</strong> {log.actor?.name || log.actorRole}</p>
              <p><strong>Role:</strong> {log.actorRole}</p>
              <p><strong>Old Status:</strong> {log.oldStatus || "-"}</p>
              <p><strong>New Status:</strong> {log.newStatus || "-"}</p>
              <p><strong>Time:</strong> {new Date(log.createdAt).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AuditLogs;