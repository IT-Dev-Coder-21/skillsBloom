import API_BASE_URL from "./config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [image, setImage] = useState("");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  // FIXED: Added "Bearer " to the Authorization header
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) { navigate("/login"); return; }
      const u = JSON.parse(storedUser);
      setUser(u);
      setTitle(u.title || "");
      setBio(u.bio || "");
      setImage(u.image || "");
      setSkillsInput(u.skills || "");
      fetchBookings(u.name);
      fetchAvailability(u.email);
    } catch (err) { navigate("/login"); }
  }, [navigate]);

  // FIXED: Added safety checks to prevent JSON parse crashes
  const fetchBookings = (mentorName) => {
    fetch(`${API_BASE_URL}/bookings`, { headers: getHeaders() })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data.filter(b => b.mentorName?.toLowerCase() === mentorName.toLowerCase()));
        }
      })
      .catch(err => console.error("Error fetching bookings:", err));
  };

  // FIXED: Added safety checks to prevent JSON parse crashes
  const fetchAvailability = (email) => {
    fetch(`${API_BASE_URL}/mentor/slots/${email}`, { headers: getHeaders() })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch slots");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAvailabilityList(data);
        } else {
          setAvailabilityList([]);
        }
      })
      .catch(err => {
        console.error("Error fetching slots:", err);
        setAvailabilityList([]);
      });
  };

  const handlePublishSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/mentor/add-slot`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email: user.email, date: dayOfWeek, time: `${startTime} - ${endTime}` })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage({ text: "Availability slot published successfully!", type: "success" });
        fetchAvailability(user.email);
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      }
    } catch (err) {
      console.error("Error publishing slot:", err);
      setStatusMessage({ text: "Failed to publish slot.", type: "error" });
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/mentor/slots/${slotId}`, { 
        method: "DELETE",
        headers: getHeaders() 
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage({ text: "Slot removed successfully.", type: "success" });
        fetchAvailability(user.email);
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      } else {
        alert("Delete failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/mentor/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ email: user.email, title, bio, skills: skillsInput, image })
      });
      if (res.ok) {
        setStatusMessage({ text: "Your profile has been updated.", type: "success" });
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const activeStudents = Array.from(new Map(bookings.map(b => [b.studentEmail, b])).values());

  return (
    <div className="dashboard-page" style={{ padding: "20px" }}>
      <header className="dashboard-topbar" style={{ borderBottom: "2px solid #673ab7", paddingBottom: "10px", marginBottom: "20px" }}>
        <h2>🌱 Skills Bloom</h2>
        <h1>Welcome Back, {user?.name}</h1>
      </header>

      <nav className="dashboard-nav" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {["home", "sessions", "students", "availability", "profile"].map(v => (
          <button key={v} onClick={() => setView(v)} className={view === v ? "active" : ""} style={{ padding: "10px 20px", cursor: "pointer" }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {statusMessage.text && <div className="status-banner" style={{ padding: "10px", background: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee", color: statusMessage.type === "success" ? "#2e7d32" : "#c62828", marginBottom: "15px", borderRadius: "5px" }}>{statusMessage.text}</div>}

        {view === "home" && (
          <section>
            <h3>Dashboard Overview</h3>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div className="card" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}><h3>{bookings.length}</h3><p>Booked Sessions</p></div>
              <div className="card" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}><h3>{activeStudents.length}</h3><p>Active Students</p></div>
              <div className="card" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}><h3>5.0</h3><p>Mentor Rating</p></div>
            </div>
          </section>
        )}

        {view === "sessions" && (
          <section>
            <h3>Manage Scheduled Sessions</h3>
            {bookings.length > 0 ? bookings.map(b => (
              <div key={b.id} style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                <strong>{b.studentName}</strong> • {b.date} at {b.time} <br/> 
                <span>Objective: {b.objective}</span>
              </div>
            )) : <p>No sessions currently scheduled.</p>}
          </section>
        )}

        {view === "students" && (
          <section>
            <h3>My Active Students</h3>
            {activeStudents.length > 0 ? activeStudents.map(s => (
              <div key={s.id} style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                <strong>{s.studentName}</strong> • <em>{s.studentEmail}</em>
              </div>
            )) : <p>No active students at this time.</p>}
          </section>
        )}

        {view === "availability" && (
          <section>
            <h3>Set Weekly Availability</h3>
            <form onSubmit={handlePublishSlot} className="professional-form" style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
              <select onChange={(e) => setDayOfWeek(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input type="time" onChange={(e) => setStartTime(e.target.value)} required style={{ flex: 1, padding: "10px" }} />
                <input type="time" onChange={(e) => setEndTime(e.target.value)} required style={{ flex: 1, padding: "10px" }} />
              </div>
              <button type="submit" style={{ padding: "10px 20px", background: "#673ab7", color: "white", border: "none", borderRadius: "4px" }}>Publish Slot</button>
            </form>
            <div style={{ marginTop: "20px" }}>
              {availabilityList.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "15px", border: "1px solid #eee", marginBottom: "5px" }}>
                  <strong>{s.available_date}</strong>: {s.available_time}
                  <button onClick={() => deleteSlot(s.id)} style={{ background: "#d32f2f", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Remove</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "profile" && (
          <section>
            <h3>Update Your Profile</h3>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
              <label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "10px" }} />
              <label>Image URL</label><input type="text" value={image} onChange={(e) => setImage(e.target.value)} style={{ padding: "10px" }} />
              <label>Biography</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="4" style={{ padding: "10px" }} />
              <label>Skills</label><input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} style={{ padding: "10px" }} />
              <button type="submit" style={{ padding: "10px", background: "#673ab7", color: "white", border: "none", cursor: "pointer" }}>Save Profile</button>
              <button type="button" onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ padding: "10px", background: "#333", color: "white", border: "none", cursor: "pointer", marginTop: "10px" }}>Sign Out</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}