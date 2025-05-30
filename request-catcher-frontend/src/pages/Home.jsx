import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [catcherId, setCatcherId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [wsStatus, setWsStatus] = useState("disconnected"); // "connecting", "connected", "error", "disconnected"

  useEffect(() => {
    const storedId = localStorage.getItem("catcherId");
    if (storedId) {
      setCatcherId(storedId);
    }
  }, []);

  // WebSocket Connection on catcherId change
  useEffect(() => {
    setWsStatus("connecting");
    if (!catcherId) return;

    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    const socketUrl = `${wsProtocol}://localhost:8000/ws/catcher/${catcherId}/`;

    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      setWsStatus("connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(event.data)
      const rawLog = JSON.parse(event.data);
        const logWithId = {
          ...rawLog,
          id: `${rawLog.timestamp}-${Math.random().toString(36).substr(2, 5)}`
        };
      setLogs((prev) => [logWithId, ...prev.slice(0, 4)]); // Keep latest 5 logs
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsStatus("error");
    };

    socketRef.current.onclose = () => {
      setWsStatus("disconnected");
    };

    return () => {
      socketRef.current.close();
    };
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
      setLogs([]);
      setExpandedIds(new Set());
    } catch (err) {
      alert("Error creating catcher ID");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToCatcher = () => {
    if (catcherId) window.open(`/catcher/${catcherId}`, "_blank");
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

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
            <code style={{ backgroundColor: "#eee", padding: "0.2rem 0.5rem", borderRadius: 4 }}>
              {window.location.origin}/catcher/{catcherId}
            </code>
          </p>
          <button onClick={goToCatcher}>Go to Catcher Page</button>
          <button onClick={createNewCatcher} disabled={loading} style={{ marginLeft: 10 }}>
            {loading ? "Creating..." : "Create New Catcher"}
          </button>

          <p>
            WebSocket status:{" "}
            <strong style={{ color: wsStatus === "connected" ? "green" : wsStatus === "error" ? "red" : "orange" }}>
              {wsStatus}
            </strong>
          </p>

          <h2 style={{ marginTop: 30 }}>Latest Requests (Top 5)</h2>

          {logs.length === 0 && <p>No requests yet.</p>}

          {logs.map((log, idx) => {
            const isExpanded = expandedIds.has(log.id);
            const expanded = idx === 0 || isExpanded;

            return (
              <div
                key={log.id}
                style={{ border: "1px solid #ddd", marginBottom: "1rem", borderRadius: 4 }}
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  style={{
                    cursor: "pointer",
                    background: expanded ? "#dceefb" : "#f0f0f0",
                    padding: "0.5rem 1rem",
                    fontWeight: "bold",
                  }}
                >
                  Log — {log.method} — {new Date(log.timestamp).toLocaleString()}
                  <span style={{ float: "right" }}>{expanded ? "▲ Collapse" : "▼ Expand"}</span>
                </div>
                {expanded && (
                  <pre style={{ background: "#f9f9f9", padding: 10 }}>
                    {`Headers:\n${formatJSON(log.headers)}\n\nQuery Params:\n${formatJSON(
                      log.query_params
                    )}\n\nBody:\n${formatJSON(log.body)}`}
                  </pre>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <button onClick={createNewCatcher} disabled={loading}>
          {loading ? "Creating..." : "Create Catcher"}
        </button>
      )}
    </div>
  );
}
