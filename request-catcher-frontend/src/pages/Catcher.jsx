import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Catcher() {
  const { catcherId } = useParams();
  const [successRequest, setSuccessRequest] = useState(null); // null = loading, true = success, false = error

  useEffect(() => {
    async function sendRequest() {
      try {
        // Make POST request to backend catcher endpoint
        const response = await axios.post(
          `${BACKEND_URL}/api/catcher/${catcherId}/`,
          {}, // assuming empty body, adjust if needed
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status >= 200 && response.status < 300) {
          setSuccessRequest(true);
        } else {
          setSuccessRequest(false);
        }
      } catch (error) {
        setSuccessRequest(false);
        console.error("Request error:", error);
      }
    }
    sendRequest();
  }, [catcherId]);

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Catcher Endpoint</h1>
      <p>
        Request made to catcher ID: <strong>{catcherId}</strong>
      </p>

      {successRequest === null && <p>Sending request...</p>}
      {successRequest === true && <p style={{ color: "green" }}>Request made successfully!</p>}
      {successRequest === false && <p style={{ color: "red" }}>Failed to make request.</p>}
    </div>
  );
}
