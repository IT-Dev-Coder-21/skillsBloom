import API_BASE_URL from "./config"; // ✅ Added configuration bridge for production/live environments
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [bookings, setBookings] = useState([]); 
  const [mentors, setMentors] = useState([]);
  
  // ✅ STATUS BANNER STATE: Replaces the browser alert boxes with clean inline notifications
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return navigate("/login");
    setUser(u);

    const hardcodedMentors = [
      {
        name: "Alice Musukwa",
        role: "Fullstack Developer",
        bio: "Helping students build modern websites and applications with cutting-edge technologies.",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQFLDhUysNv2Sw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1724589862035?e=1780531200&v=beta&t=KaFXonEAeWX8vQGHiwKtC4cmDUx8HdkY-yltuORl-Y8",
        skills: ["React", "Node.js", "HTML", "SQL", "MongoDB"]
      },
      {
        name: "Sana Abbas",
        role: "Fullstack Developer",
        bio: "Guiding students in full-stack development.",
        image: "https://media.licdn.com/dms/image/v2/C4D03AQEbMg9L9KcgaQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1638369937627?e=1780531200&v=beta&t=CDDlotK-OstXO81vw6-IMqr062Ir4XXNVquuUuAfa7w",
        skills: ["JavaScript", "Node.js", "Express", "MongoDB"]
      },
      {
        name: "Caroline Mutemi",
        role: "Software Developer",
        bio: "Designing beautiful user experiences and building scalable web applications.",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQEK-u9ItzSbiA/profile-displayphoto-crop_800_800/B4EZsqjqDtIwAI-/0/1765945552767?e=1780531200&v=beta&t=ff-Kgo8JRtKTayRdORKcd5VWM1oklT9P0ux8DzUIrPE",
        skills: ["UI/UX", "React", "TypeScript", "CSS"]
      }
    ];

    axios.get(`${API_BASE_URL}/mentors`)
      .then(res => {
        const dynamicMentors = res.data.map(m => ({
          ...m,
          skills: m.skills ? JSON.parse(m.skills) : []
        }));
        setMentors([...hardcodedMentors, ...dynamicMentors]);
      })
      .catch(err => {
        console.error("Error fetching mentors:", err);
        setMentors(hardcodedMentors);
      });

    // ✅ UPDATED ENDPOINT: Using API_BASE_URL instead of localhost
    fetch(`${API_BASE_URL}/bookings`)
      .then((res) => res.json())
      .then((data) => {
        const myBookings = data.filter(b => b.studentEmail === u.email);
        setBookings(myBookings);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setStatusMessage({ text: "Failed to load active tracking sessions from server. 🖥️", type: "error" });
      });
  }, [navigate]);

  // 🗑️ HANDLE CANCELLING A SESSION
  const handleCancelBooking = async (bookingId) => {
    // Keeps a clean safety checkpoint so sessions aren't dropped by accident
    if (!window.confirm("Are you sure you want to cancel this scheduled session? ⏳")) {
      return;
    }

    try {
      // ✅ UPDATED ENDPOINT: Using API_BASE_URL instead of localhost
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Session cancelled successfully! ✅", type: "success" });
        
        // Remove from UI instantly
        setBookings(bookings.filter(b => b.id !== bookingId));

        // Auto-clear the message after 3 seconds
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      } else {
        setStatusMessage({ text: data.message || "Failed to cancel the session. ❌", type: "error" });
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      setStatusMessage({ text: "Server error — could not cancel session.", type: "error" });
    }
  };

  if (!user) return <div className="loading" style={{ padding: "40px", textAlign: "center" }}><h2>Loading Student Workspace...</h2></div>;

  return (
    <div className="dashboard-page">
      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <h2>🌱 Skills Bloom</h2>
        </div>
        <div className="topbar-center">
          <h1>Welcome back, {user.name}! 🎓</h1>
        </div>
        <div className="topbar-right">
          <span className="student-role" style={{ background: "#4CAF50", color: "white", padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
            Student
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="dashboard-nav">
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>📚 Home</button>
        <button className={view === "mentors" ? "active" : ""} onClick={() => setView("mentors")}>👨‍🏫 Mentors</button>
        <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>⚙️ Profile</button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">
        
        {/* ✅ STATUS MESSAGE NOTIFICATION BANNER */}
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease-in-out"
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* HOME VIEW */}
        {view === "home" && (
          <div className="dashboard-view">
            <div className="welcome-card" style={{ background: "linear-gradient(135deg, #4CAF50, #2E7D32)", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <h2>Start Your Learning Journey! 🚀</h2>
              <p>Connect with expert mentors and schedule your peer-to-peer tracking sessions seamlessly.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{mentors.length}</h3>
                <p>Available Mentors</p>
              </div>
              <div className="stat-card">
                <h3>{bookings.length}</h3>
                <p>Booked Sessions</p>
              </div>
            </div>

            <div className="quick-access" style={{ marginTop: "20px" }}>
              <h3>My Booked Sessions</h3>
              {bookings.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#666", padding: "10px 0" }}>
                  No sessions booked yet. Head to the Mentors tab to schedule one!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                  {bookings.map((b, index) => (
                    <div 
                      key={b.id || index} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "15px", 
                        background: "#f9f9f9", 
                        borderRadius: "8px", 
                        borderLeft: "4px solid #4CAF50",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "16px", color: "#333" }}>{b.mentorName}</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#555" }}>
                          📌 <strong>Objective:</strong> {b.objective}
                        </p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#777" }}>
                          📅 {b.date} | ⏰ {b.time}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        style={{
                          backgroundColor: "#ff4d4d",
                          color: "white",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "13px",
                          transition: "background 0.2s ease"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#cc0000"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#ff4d4d"}
                      >
                        Cancel Session 🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quick-access" style={{ marginTop: "25px" }}>
              <h3>Quick Access</h3>
              <button className="quick-btn" style={{ background: "#4CAF50", color: "white", padding: "10px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setView("mentors")}>Browse Mentors →</button>
            </div>
          </div>
        )}

        {/* MENTORS VIEW */}
        {view === "mentors" && (
          <div className="dashboard-view">
            <h2>👨‍🏫 Connect with Mentors</h2>
            <p className="section-desc" style={{ color: "#666", marginBottom: "20px" }}>Click "Book Session" to choose an open date and timeline slot with a program mentor.</p>
            <div className="mentors-grid">
              {mentors.map((mentor, index) => (
                <div key={index} className="mentor-card" style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #eee", textAlign: "center" }}>
                  <div className="mentor-image-container" style={{ marginBottom: "10px" }}>
                    <img 
                      src={mentor.image} 
                      alt={mentor.name} 
                      className="mentor-card-img" 
                      style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                  <h3>{mentor.name}</h3>
                  <p className="specialty" style={{ fontWeight: "600", color: "#4CAF50" }}>{mentor.role}</p>
                  <p className="bio-text" style={{ fontSize: "13px", color: "#666", margin: "8px 0" }}>{mentor.bio}</p>
                  
                  <div className="skills-container" style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", margin: "10px 0" }}>
                    {mentor.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="skill-pill" style={{ background: "#e8f5e9", color: "#2e7d32", padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    className="connect-btn" 
                    onClick={() => navigate(`/book/${mentor.name}`)}
                    style={{ width: "100%", background: "#4CAF50", color: "white", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
                  >
                    Book Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* PROFILE VIEW */}
        {view === "profile" && (
          <div className="dashboard-view">
            <div className="profile-card" style={{ maxWidth: "500px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <h2>My Profile</h2>
              <div className="profile-info" style={{ marginTop: "15px" }}>
                <div className="info-group" style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <label style={{ fontWeight: "bold", color: "#555" }}>Full Name: </label>
                  <span>{user.name}</span>
                </div>
                <div className="info-group" style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <label style={{ fontWeight: "bold", color: "#555" }}>Email Address: </label>
                  <span>{user.email}</span>
                </div>
                <div className="info-group" style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <label style={{ fontWeight: "bold", color: "#555" }}>Account Type: </label>
                  <span>Student Workspace</span>
                </div>
              </div>
              <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
              >
                Logout Account Session
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

