import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [catcherId, setCatcherId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const navigate = useNavigate();

  const intervalRef = useRef(null);

  // Load catcherId from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem("catcherId");
    if (storedId) {
      setCatcherId(storedId);
    }
  }, []);

  // Poll logs every 3 seconds if catcherId exists
  useEffect(() => {
    if (!catcherId) return;

    async function fetchLogs() {
      setLogsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/logs/${catcherId}/`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data); // assuming data is array of logs
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLogsLoading(false);
      }
    }

    fetchLogs();

    intervalRef.current = setInterval(fetchLogs, 3000);

    return () => clearInterval(intervalRef.current);
  }, [catcherId]);

  const createNewCatcher = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-catcher/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create catcher");
      const data = await res.json();
      localStorage.setItem("catcherId", data.catcher_id);
      setCatcherId(data.catcher_id);
      setLogs([]); // reset logs on new catcher
      setExpandedIds(new Set());
    } catch (err) {
      alert("Error creating catcher ID");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToCatcher = () => {
    if (catcherId) navigate(`/catcher/${catcherId}`);
  };

  // Toggle expand/collapse for logs except first
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Helper to format JSON nicely
  const formatJSON = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Request Catcher</h1>

      {catcherId ? (
        <>
          <p>
            Your catcher URL (send HTTP requests here):
            <br />
            <code
              style={{
                backgroundColor: "#eee",
                padding: "0.2rem 0.5rem",
                borderRadius: 4,
                userSelect: "all",
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              {window.location.origin}/catcher/{catcherId}
            </code>
          </p>
          <button onClick={goToCatcher}>Go to Catcher Page</button>
          <button onClick={createNewCatcher} disabled={loading} style={{ marginLeft: 10 }}>
            {loading ? "Creating..." : "Create New Catcher"}
          </button>

          <h2 style={{ marginTop: 30 }}>Latest Requests (Top 5)</h2>

          {logsLoading && <p style={{ minHeight: "1.5em" }}>Loading logs...</p>}
          {!logsLoading && logs.length === 0 && <p>No requests yet.</p>}

          {logs.length > 0 && (
            <div>
              {/* First log always expanded */}
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  marginBottom: "1rem",
                  background: "#f9f9f9",
                  borderRadius: 4,
                }}
              >
                <h3>Latest Log (ID: {logs[0].id})</h3>
                <p>
                  <strong>Method:</strong> {logs[0].method} <br />
                  <strong>Path:</strong> {logs[0].path} <br />
                  <strong>Timestamp:</strong> {new Date(logs[0].timestamp).toLocaleString()}
                </p>
                <details open>
                  <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Details</summary>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      background: "#eee",
                      padding: 10,
                      borderRadius: 4,
                      marginTop: 8,
                    }}
                  >
                    {`Headers:\n${formatJSON(logs[0].headers)}\n\nQuery Params:\n${formatJSON(
                      logs[0].query_params
                    )}\n\nBody:\n${formatJSON(logs[0].body)}`}
                  </pre>
                </details>
              </div>

              {/* Rest logs collapsible */}
              {logs.slice(1, 5).map((log) => {
                const isExpanded = expandedIds.has(log.id);
                return (
                  <div
                    key={log.id}
                    style={{
                      border: "1px solid #ddd",
                      marginBottom: "0.5rem",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => toggleExpand(log.id)}
                      style={{
                        cursor: "pointer",
                        background: isExpanded ? "#dceefb" : "#f0f0f0",
                        padding: "0.5rem 1rem",
                        fontWeight: "bold",
                        userSelect: "none",
                      }}
                      aria-expanded={isExpanded}
                    >
                      Log ID: {log.id} — {log.method} — {new Date(log.timestamp).toLocaleString()}
                      <span style={{ float: "right" }}>{isExpanded ? "▲ Collapse" : "▼ Expand"}</span>
                    </div>
                    {isExpanded && (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          background: "#fafafa",
                          padding: 10,
                          margin: 0,
                        }}
                      >
                        {`Path: ${log.path}\n\nHeaders:\n${formatJSON(log.headers)}\n\nQuery Params:\n${formatJSON(
                          log.query_params
                        )}\n\nBody:\n${formatJSON(log.body)}`}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <button onClick={createNewCatcher} disabled={loading}>
          {loading ? "Creating..." : "Create Catcher"}
        </button>
      )}
    </div>
  );
}
