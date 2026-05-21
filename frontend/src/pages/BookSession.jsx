import API_BASE_URL from "./config"; // ✅ Imported configuration bridge for deployment stability
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BookSession() {
  const { mentorName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ STATUS BANNER STATE: Clean on-screen user alerts
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    date: "",
    time: "",
    objective: ""
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      navigate("/login");
      return;
    }
    setUser(u);
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.time || !form.objective) {
      setStatusMessage({ text: "Please fill in all fields before booking! ⚠️", type: "error" });
      return;
    }

    const newBooking = {
      mentorName: mentorName,
      studentName: user.name,
      studentEmail: user.email,
      date: form.date,
      time: form.time,
      objective: form.objective
    };

    try {
      // ✅ UPDATED ENDPOINT: Swapped hardcoded localhost with dynamic configuration path
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBooking)
      });

      // Catch backend errors (like a 500 server crash) gracefully before parsing JSON
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({ 
          text: errorData.errorDetails || `Server error (${res.status}). Check your backend console! 🖥️`, 
          type: "error" 
        });
        return;
      }

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Session booked successfully! Redirecting... 🎉", type: "success" });
        
        // Brief view delay before sending back to tracking panel
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 2000);
      } else {
        setStatusMessage({ text: data.message || "Failed to book session. Please try again.", type: "error" });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setStatusMessage({ text: "Server error — is the backend database running? 🖥️", type: "error" });
    }
  };

  if (!user) return <div className="loading" style={{ padding: "40px", textAlign: "center" }}><h2>Loading Context Parameters...</h2></div>;

  return (
    <div className="booking-page-container" style={{ padding: "40px 20px", maxWidth: "500px", margin: "0 auto" }}>
      <div className="auth-container" style={{ padding: "30px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ marginBottom: "10px", color: "#333" }}>📅 Book a Session</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>Scheduling a sync with <strong>{mentorName}</strong></p>

        {/* ✅ DYNAMIC STATUS BANNER */}
        {statusMessage.text && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: "500",
            backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee",
            color: statusMessage.type === "success" ? "#2e7d32" : "#c62828",
            border: statusMessage.type === "success" ? "1px solid #a5d6a7" : "1px solid #ef9a9a",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Date</label>
            <input 
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Time</label>
            <input 
              type="time" 
              name="time" 
              value={form.time} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Learning Objective / Topic</label>
            <textarea 
              name="objective" 
              placeholder="e.g., Troubleshooting React state rendering problems or reviewing EJS structures..." 
              value={form.objective} 
              onChange={handleChange} 
              rows="4"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontFamily: "inherit", resize: "none" }}
            />
          </div>

          <button type="submit" className="login-btn" style={{ width: "100%", padding: "12px", marginTop: "10px", fontWeight: "bold" }}>
            Confirm Appointment
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate("/student-dashboard")}
            style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#666", fontWeight: "500" }}
          >
            Cancel and Go Back
          </button>
        </form>
      </div>
    </div>
  );
}