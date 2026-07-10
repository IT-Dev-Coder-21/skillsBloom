import API_BASE_URL from "./config"; 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [bookings, setBookings] = useState([]); 
  const [mentors, setMentors] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  
  const navigate = useNavigate();

  // ✅ UNIFIED HEADER HELPER: Use this for every fetch to prevent 401 errors
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) { navigate("/login"); return; }
    setUser(u);

    // 1. Fetch Dynamic Mentors
    fetch(`${API_BASE_URL}/api/mentors`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const dynamicMentors = data.map(m => ({
          name: m.name,
          role: m.title || "Mentor",
          bio: m.bio || "FullStack Developer",
          image: m.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF8lcfoid-LoJTXdstktO7Z9AvAF9UX9wRLlDvxHncVg&s=10",
          skills: typeof m.skills === 'string' ? JSON.parse(m.skills || "[]") : (Array.isArray(m.skills) ? m.skills : [])
        }));
        setMentors(dynamicMentors);
      })
      .catch((err) => console.error("Error fetching mentors:", err));

    // 2. Fetch Bookings
    fetch(`${API_BASE_URL}/bookings`, { 
      method: "GET",
      headers: {
    "Content-Type": "application/json",
    // Only send the header if the token actually exists
    ...(localStorage.getItem("token") ? { "Authorization": `Bearer ${localStorage.getItem("token")}` } : {})
  }
    })
    .then((res) => {
      if (res.status === 401) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        const myBookings = data.filter(b => b.studentEmail === u.email);
        setBookings(myBookings);
      }
    })
    .catch((err) => console.error("Fetch error:", err));
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled session? ⏳")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, { 
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Session cancelled successfully! ✅", type: "success" });
        setBookings(bookings.filter(b => b.id !== bookingId));
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      setStatusMessage({ text: "Server error — could not cancel session.", type: "error" });
    }
  };

  if (!user) return <div className="loading" style={{ padding: "40px", textAlign: "center" }}><h2>Loading Student Workspace...</h2></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="topbar-left"><h2>🌱 Skills Bloom</h2></div>
        <div className="topbar-center"><h1>Welcome back, {user.name}! 🎓</h1></div>
        <div className="topbar-right">
          <span style={{ background: "#4CAF50", color: "white", padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>Student</span>
        </div>
      </div>

      <div className="dashboard-nav">
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>📚 Home</button>
        <button className={view === "mentors" ? "active" : ""} onClick={() => setView("mentors")}>👨‍🏫 Mentors</button>
        <button className={view === "profile" ? "active" : ""} onClick={() => setView("profile")}>⚙️ Profile</button>
      </div>

      <div className="dashboard-content">
        {statusMessage.text && (
          <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "20px", textAlign: "center", backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee", color: statusMessage.type === "success" ? "#2e7d32" : "#c62828", border: statusMessage.type === "success" ? "1px solid #a5d6a7" : "1px solid #ef9a9a" }}>
            {statusMessage.text}
          </div>
        )}

        {view === "home" && (
          <div className="dashboard-view">
            <div className="welcome-card" style={{ background: "linear-gradient(135deg, #4CAF50, #2E7D32)", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <h2>Start Your Learning Journey! 🚀</h2>
            </div>
            
            <div className="stats-grid" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <div className="stat-card" style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #eee", textAlign: "center" }}>
                <h3 style={{ fontSize: "24px", margin: "0 0 10px 0", color: "#4CAF50" }}>{mentors.length}</h3>
                <p style={{ margin: 0, color: "#666" }}>Available Mentors</p>
              </div>
              <div className="stat-card" style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #eee", textAlign: "center" }}>
                <h3 style={{ fontSize: "24px", margin: "0 0 10px 0", color: "#4CAF50" }}>{bookings.length}</h3>
                <p style={{ margin: 0, color: "#666" }}>Booked Sessions</p>
              </div>
            </div>

            <div className="quick-access" style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
              <h3 style={{ marginBottom: "15px", borderBottom: "2px solid #4CAF50", display: "inline-block", paddingBottom: "5px" }}>My Booked Sessions</h3>
              {bookings.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
                  <p style={{ fontSize: "16px", marginBottom: "10px" }}>You have not booked any sessions yet. 📅</p>
                  <button onClick={() => setView("mentors")} style={{ background: "#4CAF50", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Find a Mentor</button>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "10px", borderLeft: "5px solid #4CAF50" }}>
                    <div>
                      <strong style={{ fontSize: "18px", color: "#333" }}>{b.mentorName}</strong>
                      <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>📅 {b.date} | ⏰ {b.time}</p>
                    </div>
                    <button onClick={() => handleCancelBooking(b.id)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Cancel Slot ❌</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === "mentors" && (
          <div className="dashboard-view">
            <h2>👨‍🏫 Connect with Mentors</h2>
            <div className="mentors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
              {mentors.map((mentor, index) => (
                <div key={index} className="mentor-card" style={{ padding: "20px", background: "#fff", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
                  <img src={mentor.image} alt={mentor.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }} />
                  <h3 style={{ margin: "0 0 5px 0" }}>{mentor.name}</h3>
                  <p style={{ fontWeight: "600", color: "#4CAF50", margin: "0 0 10px 0" }}>{mentor.role}</p>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>{mentor.bio}</p>
                  <button onClick={() => navigate(`/book/${mentor.name}`)} style={{ width: "100%", background: "#4CAF50", color: "white", border: "none", padding: "10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Book Session</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {view === "profile" && (
          <div className="dashboard-view" style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #eee" }}>
            <h2>My Profile</h2>
            <div style={{ marginTop: "20px" }}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ padding: "10px 20px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}