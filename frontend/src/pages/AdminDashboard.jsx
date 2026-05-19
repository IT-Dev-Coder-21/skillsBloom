import API_BASE_URL from "./config"; // ✅ Imported global configuration bridge for API endpoints
import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [pendingMentors, setPendingMentors] = useState([]);
  
  // ✅ ENHANCED STATE: Replaced raw string state with object layout for standard banner rendering
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  // Fetch pending mentors when the dashboard opens
  useEffect(() => {
    // ✅ UPDATED ENDPOINT: Migrated path string to configuration base url
    fetch(`${API_BASE_URL}/admin/pending-mentors`)
      .then((res) => res.json())
      .then((data) => setPendingMentors(data))
      .catch((err) => {
        console.error("Error fetching mentors:", err);
        setStatusMessage({ text: "Failed to pull pending verification entries from database. 🖥️", type: "error" });
      });
  }, []);

  // Handle clicking the approval button
  const handleApprove = async (mentorId) => {
    try {
      // ✅ UPDATED ENDPOINT: Migrated path string to configuration base url
      const res = await fetch(`${API_BASE_URL}/admin/approve-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Mentor authorized successfully! Notification pipeline updated. 🎉", type: "success" });
        
        // Filter out the newly approved mentor from the UI list instantly
        setPendingMentors(pendingMentors.filter(m => m.id !== mentorId));

        // Clear notification context window automatically after 3.5 seconds
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3500);
      } else {
        setStatusMessage({ text: data.message || "Authorization execution failed.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Approval failed: " + err.message, type: "error" });
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#333" }}>🌸 Skills Bloom — Administrator Panel</h2>
      
      {/* ✅ STATUS MESSAGE NOTIFICATION BANNER */}
      {statusMessage.text && (
        <div style={{
          padding: "14px",
          borderRadius: "6px",
          marginTop: "15px",
          marginBottom: "20px",
          fontSize: "14px",
          textAlign: "center",
          fontWeight: "500",
          backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee",
          color: statusMessage.type === "success" ? "#2e7d32" : "#c62828",
          border: statusMessage.type === "success" ? "1px solid #a5d6a7" : "1px solid #ef9a9a",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease-in-out"
        }}>
          {statusMessage.text}
        </div>
      )}

      <hr style={{ border: "0", borderTop: "1px solid #eee", margin: "20px 0" }} />
      
      <h3 style={{ color: "#444", marginBottom: "15px" }}>Mentors Awaiting Verification</h3>
      {pendingMentors.length === 0 ? (
        <p style={{ color: "#777", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "5px", border: "1px solid #eee" }}>
          No mentors currently awaiting verification. Everything is up to date! ✅
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #ddd", color: "#555" }}>ID</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ddd", color: "#555" }}>Full Name</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ddd", color: "#555" }}>Email Address</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #ddd", color: "#555" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingMentors.map((mentor) => (
              <tr key={mentor.id} style={{ transition: "background 0.2s" }}>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd", color: "#666" }}>{mentor.id}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}><strong>{mentor.name}</strong></td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd", color: "#444" }}>{mentor.email}</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  <button 
                    onClick={() => handleApprove(mentor.id)}
                    style={{ 
                      backgroundColor: "#4CAF50", 
                      color: "white", 
                      border: "none", 
                      padding: "8px 16px", 
                      cursor: "pointer", 
                      borderRadius: "4px", 
                      fontWeight: "bold",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#388E3C"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
                  >
                    Approve Mentor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}