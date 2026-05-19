import API_BASE_URL from "./config"; // ✅ Added configuration bridge for smooth deployment switching
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  
  // ✅ PRESENTATION SIMULATION DATA: Pre-loaded so your dashboard looks fully alive
  const [bookings, setBookings] = useState([
    {
      id: 101,
      studentName: "Chikondi Phiri",
      studentEmail: "cphiri@mubas.ac.mw",
      objective: "Full-Stack E-commerce API Setup & Node Route Debugging",
      date: "2026-05-21",
      time: "10:00 AM"
    },
    {
      id: 102,
      studentName: "Limbani Banda",
      studentEmail: "lbanda@mubas.ac.mw",
      objective: "Skills Bloom Interactive UI Components & State Tracking Sync",
      date: "2026-05-22",
      time: "02:15 PM"
    }
  ]);

  // ✅ SIMULATED INPUT STATES FOR AVAILABILITY
  const [availDate, setAvailDate] = useState("");
  const [availTime, setAvailTime] = useState("");
  
  // ✅ STATUS BANNER STATE: Shows crisp feedback banners on the screen
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  // ✅ LOAD USER SAFELY
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const u = JSON.parse(storedUser);

      if (!u) {
        navigate("/login");
        return;
      }

      if (u.role !== "mentor") {
        navigate("/");
        return;
      }

      setUser(u);
    } catch (err) {
      console.log("User parse error:", err);
      navigate("/login");
    }
  }, [navigate]);

  // ✅ SIMULATED ACTION HANDLERS FOR PRESENTATION FLOW
  const handleOpenLogs = (studentName) => {
    setStatusMessage({
      text: `Opening historic milestone tracking repositories for ${studentName}... 📂`,
      type: "success"
    });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
  };

  const handlePublishSlot = (e) => {
    e.preventDefault();
    if (!availDate || !availTime) {
      setStatusMessage({ text: "Please select both a valid date and time slot first.", type: "error" });
      return;
    }
    setStatusMessage({
      text: `Success! Open timeline slot [${availDate} at ${availTime}] published to student selection catalog. 🎉`,
      type: "success"
    });
    setAvailDate("");
    setAvailTime("");
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 5000);
  };

  // ✅ PREVENT BLANK SCREEN WHILE LOADING USER
  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Mentor Workspace...</h2>
      </div>
    );
  }

  // Derived unique list from your presentation data array
  const activeStudents = [
    { id: 1, name: "Chikondi Phiri", email: "cphiri@mubas.ac.mw" },
    { id: 2, name: "Limbani Banda", email: "lbanda@mubas.ac.mw" }
  ];

  return (
    <div className="dashboard-page">

      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <h2>🌱 Skills Bloom</h2>
        </div>
        <div className="topbar-center">
          <h1>Welcome back, {user.name}! 👨‍🏫</h1>
        </div>
        <div className="topbar-right">
          <span className="mentor-role" style={{ background: "#9c27b0", color: "white", padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
            Faculty Mentor
          </span>
        </div>
      </div>

      {/* NAV */}
      <div className="dashboard-nav">
        <button onClick={() => setView("home")} className={view === "home" ? "active" : ""}>🏠 Overview</button>
        <button onClick={() => setView("sessions")} className={view === "sessions" ? "active" : ""}>📅 Sessions ({bookings.length})</button>
        <button onClick={() => setView("students")} className={view === "students" ? "active" : ""}>👨‍🎓 My Students ({activeStudents.length})</button>
        <button onClick={() => setView("availability")} className={view === "availability" ? "active" : ""}>⏰ Availability</button>
        <button onClick={() => setView("profile")} className={view === "profile" ? "active" : ""}>⚙️ Profile</button>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="dashboard-content">

        {/* ✅ STATUS MESSAGE BANNER */}
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
            transition: "all 0.3s ease"
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* OVERVIEW */}
        {view === "home" && (
          <div className="dashboard-view">
            <div className="welcome-card" style={{ background: "linear-gradient(135deg, #673ab7, #9c27b0)", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <h2>Mentor Tracking Dashboard 🚀</h2>
              <p>Monitor project submissions, coordinate milestone tracking slots, and manage student communication efficiently.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{bookings.length}</h3>
                <p>Scheduled Tracking Syncs</p>
              </div>

              <div className="stat-card">
                <h3>{activeStudents.length}</h3>
                <p>Assigned Students</p>
              </div>

              <div className="stat-card">
                <h3>5.0⭐</h3>
                <p>Student Rating Score</p>
              </div>
            </div>
            
            <div className="quick-access" style={{ marginTop: "25px" }}>
              <h3>Next Milestone Action</h3>
              <button className="quick-btn" style={{ background: "#673ab7", color: "white", padding: "10px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setView("sessions")}>
                View Meeting Agenda Sheets →
              </button>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {view === "sessions" && (
          <div className="dashboard-view">
            <h2>📅 Scheduled Milestone Syncs</h2>
            <p style={{ color: "#666", marginBottom: "15px", fontSize: "14px" }}>Below are the appointments scheduled directly by students via their dashboard profiles.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {bookings.map((b) => (
                <div key={b.id} className="session-card" style={{ padding: "20px", background: "#fff", borderLeft: "5px solid #9c27b0", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>👨‍🎓 {b.studentName}</h3>
                      <span style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "8px" }}>📧 Contact: {b.studentEmail}</span>
                      <p style={{ margin: "5px 0", fontSize: "14px", color: "#444" }}>
                        🎯 <strong>Target Agenda:</strong> {b.objective}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", background: "#f3e5f5", padding: "8px 12px", borderRadius: "6px" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#7b1fa2" }}>📅 {b.date}</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#7b1fa2", marginTop: "2px" }}>⏰ {b.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {view === "students" && (
          <div className="dashboard-view">
            <h2>👨‍🎓 Active MUBAS Students</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>Students who have established peer tracking history records with your profile.</p>

            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
              {activeStudents.map(s => (
                <div key={s.id} className="student-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>{s.name}</h3>
                  <p style={{ color: "#666", fontSize: "13px", margin: "5px 0 15px 0" }}>{s.email}</p>
                  <button 
                    onClick={() => handleOpenLogs(s.name)}
                    style={{ width: "100%", background: "#f3e5f5", color: "#7b1fa2", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Open Tracking History Logs
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABILITY */}
        {view === "availability" && (
          <div className="dashboard-view">
            <h2>⏰ Setup Calendar Slots</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>Publish open timeline blocks for students to select during enrollment.</p>

            <form onSubmit={handlePublishSlot} style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", maxWidth: "400px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Available Date</label>
                <input 
                  type="date" 
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} 
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Available Time</label>
                <input 
                  type="time" 
                  value={availTime}
                  onChange={(e) => setAvailTime(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} 
                />
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: "#9c27b0", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                Publish Time Block
              </button>
            </form>
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && (
          <div className="dashboard-view">
            <h2>⚙️ Profile Control</h2>
            
            <div className="profile-card" style={{ maxWidth: "500px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <p style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}><b>Full Registered Name:</b> {user.name}</p>
              <p style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}><b>Email Account:</b> {user.email}</p>
              <p style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}><b>System Rank:</b> Verified Mentor</p>

              <button
                className="logout-btn"
                style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                Terminate Active Session (Logout)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}