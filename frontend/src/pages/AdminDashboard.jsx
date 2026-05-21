import API_BASE_URL from "./config";
import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  // Fetch pending mentors on load
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/pending-mentors`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setPendingMentors(data))
      .catch(() => setStatusMessage({ text: "Failed to load database entries from the server. 🖥️", type: "error" }));
  }, []);

  // Handle Approval
  const handleApprove = async (mentorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approve-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId })
      });
      
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Mentor authorized successfully! They are now live on the platform. 🎉", type: "success" });
        setPendingMentors(pendingMentors.filter(m => m.id !== mentorId));
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
      } else {
        setStatusMessage({ text: "Approval failed.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Server unreachable.", type: "error" });
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto" }}>
      <h2>🌸 Skills Bloom — Administrator Panel</h2>
      
      {/* Notification Banner */}
      {statusMessage.text && (
        <div style={{
          padding: "12px", 
          marginBottom: "20px", 
          borderRadius: "6px",
          fontWeight: "500",
          backgroundColor: statusMessage.type === "success" ? "#d4edda" : "#f8d7da",
          color: statusMessage.type === "success" ? "#155724" : "#721c24",
          border: statusMessage.type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
        }}>
          {statusMessage.text}
        </div>
      )}

      <h3 style={{ marginTop: "30px", marginBottom: "15px", color: "#333" }}>Mentors Awaiting Verification</h3>
      
      {pendingMentors.length === 0 ? (
        <div style={{ padding: "30px", background: "#f9f9f9", borderRadius: "6px", border: "1px dashed #ccc", textAlign: "center", color: "#666" }}>
          <p style={{ margin: 0, fontWeight: "500" }}>No mentors awaiting verification. All caught up! ✨</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderRadius: "6px", overflow: "hidden" }}>
          <thead>
            <tr style={{ textAlign: "left", backgroundColor: "#f4f6f8", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px 15px" }}>ID</th>
              <th style={{ padding: "12px 15px" }}>Avatar</th>
              <th style={{ padding: "12px 15px" }}>Name</th>
              <th style={{ padding: "12px 15px" }}>Email</th>
              <th style={{ padding: "12px 15px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingMentors.map((mentor) => (
              <tr key={mentor.id} style={{ borderBottom: "1px solid #eee", verticalAlign: "middle" }}>
                <td style={{ padding: "12px 15px", color: "#666", fontSize: "14px" }}>{mentor.id}</td>
                
                {/* 🖼️ DEFAULT PROFILE PICTURE DISPLAY ADDED HERE */}
                <td style={{ padding: "12px 15px" }}>
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png" 
                    alt="Default Mentor Profile" 
                    style={{ width: "40px", height: "40px", borderRadius: "50%", display: "block" }}
                  />
                </td>

                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#2c3e50" }}>{mentor.name}</td>
                <td style={{ padding: "12px 15px", color: "#555" }}>{mentor.email}</td>
                <td style={{ padding: "12px 15px", textAlign: "center" }}>
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
                      fontSize: "13px"
                    }}
                  >
                    Approve
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