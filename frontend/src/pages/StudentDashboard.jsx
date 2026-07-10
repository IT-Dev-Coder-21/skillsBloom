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

  // Helper to get secured headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return navigate("/login");
    setUser(u);

    // Fetch Dynamic Mentors from Database
    fetch(`${API_BASE_URL}/api/mentors`, { headers: getHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mentors");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        const dynamicMentors = data.map(m => {
          let parsedSkills = [];
          try {
            parsedSkills = typeof m.skills === 'string' ? JSON.parse(m.skills) : (Array.isArray(m.skills) ? m.skills : []);
          } catch(e) {
            parsedSkills = m.skills ? m.skills.split(',').map(s => s.trim()) : [];
          }
          return {
            name: m.name,
            role: m.title || "Mentor",
            bio: m.bio || "FullStak Developer",
            image: m.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF8lcfoid-LoJTXdstktO7Z9AvAF9UX9wRLlDvxHncVg&s=10",
            skills: parsedSkills
          };
        });
        setMentors(dynamicMentors);
      })
      .catch((err) => console.error("Error fetching mentors:", err));

    // Fetch Bookings (FIXED WITH SAFETY CHECK)
    fetch(`${API_BASE_URL}/bookings`, { headers: getHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const myBookings = data.filter(b => b.studentEmail === u.email);
          setBookings(myBookings);
        } else {
          setBookings([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      });
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
          <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "20px", textAlign: "center", backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee", color: statusMessage.type === "success" ? "#2e7d32" : "#c62828" }}>
            {statusMessage.text}
          </div>
        )}

        {view === "home" && (
          <div className="dashboard-view">
            <div className="welcome-card" style={{ background: "linear-gradient(135deg, #4CAF50, #2E7D32)", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <h2>Start Your Learning Journey! 🚀</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><h3>{mentors.length}</h3><p>Available Mentors</p></div>
              <div className="stat-card"><h3>{bookings.length}</h3><p>Booked Sessions</p></div>
            </div>
            <div className="quick-access" style={{ marginTop: "20px" }}>
              <h3>My Booked Sessions</h3>
              {bookings.map((b) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "15px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "10px" }}>
                  <div><strong>{b.mentorName}</strong><p>📅 {b.date} | ⏰ {b.time}</p></div>
                  <button onClick={() => handleCancelBooking(b.id)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "8px", borderRadius: "6px" }}>Cancel</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "mentors" && (
          <div className="dashboard-view">
            <h2>👨‍🏫 Connect with Mentors</h2>
            <div className="mentors-grid">
              {mentors.map((mentor, index) => (
                <div key={index} className="mentor-card" style={{ padding: "20px", background: "#fff", border: "1px solid #eee", textAlign: "center" }}>
                  <img src={mentor.image} alt={mentor.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} />
                  <h3>{mentor.name}</h3>
                  <p style={{ fontWeight: "600", color: "#4CAF50" }}>{mentor.role}</p>
                  <p style={{ fontSize: "13px", color: "#666" }}>{mentor.bio}</p>
                  <button onClick={() => navigate(`/book/${mentor.name}`)} style={{ width: "100%", background: "#4CAF50", color: "white", border: "none", padding: "10px", borderRadius: "4px", marginTop: "10px" }}>Book Session</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {view === "profile" && (
          <div className="dashboard-view">
            <h2>My Profile</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ marginTop: "20px", padding: "10px", background: "#ff4d4d", color: "white", border: "none" }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}