import API_BASE_URL from "./config"; // ✅ Added configuration bridge for smooth deployment switching
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  
  // AVAILABILITY INPUT STATES (WEEKLY SLOTS)
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // PROFILE INPUT STATES (FOR MENTOR PORTRAIT DETAILS)
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [image, setImage] = useState("");
  
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

      if (!u || u.role !== "mentor") {
        navigate("/");
        return;
      }

      setUser(u);
      
      // Initialize profile form
      setTitle(u.title || "");
      setBio(u.bio || "");
      setImage(u.image || "");
      let sk = [];
      try {
        sk = typeof u.skills === 'string' ? JSON.parse(u.skills) : (Array.isArray(u.skills) ? u.skills : []);
      } catch(e) {
        sk = u.skills ? u.skills.split(',').map(s => s.trim()) : [];
      }
      setSkillsInput(sk.join(", "));

      // Fetch bookings & availability
      fetchBookings(u.name);
      fetchAvailability(u.id);

    } catch (err) {
      console.log("User parse error:", err);
      navigate("/login");
    }
  }, [navigate]);

  const fetchBookings = (mentorName) => {
    fetch(`${API_BASE_URL}/bookings`)
      .then(res => res.json())
      .then(data => {
        const myBookings = data.filter(b => b.mentorName.toLowerCase() === mentorName.toLowerCase());
        setBookings(myBookings);
      })
      .catch(err => console.error("Error fetching bookings:", err));
  };

  const fetchAvailability = (mentorId) => {
    fetch(`${API_BASE_URL}/mentors/${mentorId}/availability`)
      .then(res => res.json())
      .then(data => setAvailabilityList(data))
      .catch(err => console.error("Error fetching availability:", err));
  };

  // ✅ ACTION HANDLERS
  const handleOpenLogs = (studentName) => {
    setStatusMessage({
      text: `Opening historic milestone tracking repositories for ${studentName}... 📂`,
      type: "success"
    });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
  };

  const handlePublishSlot = async (e) => {
    e.preventDefault();
    if (!dayOfWeek || !startTime || !endTime) {
      setStatusMessage({ text: "Please select a valid day, start time, and end time slot.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/mentors/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: user.id,
          dayOfWeek,
          startTime,
          endTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `Success! Availability slot [${dayOfWeek} ${startTime} - ${endTime}] published. 🎉`, type: "success" });
        fetchAvailability(user.id);
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
      } else {
        setStatusMessage({ text: data.message || "Failed to publish slot.", type: "error" });
      }
    } catch(err) {
      console.error(err);
      setStatusMessage({ text: "Server error while saving slot.", type: "error" });
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this availability slot? ⏳")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/mentors/availability/${slotId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Availability slot removed! 🗑️", type: "success" });
        fetchAvailability(user.id);
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      } else {
        setStatusMessage({ text: data.message || "Failed to delete slot.", type: "error" });
      }
    } catch(err) {
      console.error(err);
      setStatusMessage({ text: "Server error deleting slot.", type: "error" });
    }
  };

  // Inside MentorDashboard.jsx, locate handleSaveProfile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const parsedSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch(`${API_BASE_URL}/mentors/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          title,
          bio,
          skills: JSON.stringify(parsedSkills),
          image // Ensure this variable 'image' is being passed here
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Profile updated! 🌸", type: "success" });
        const updatedUser = { ...user, title, bio, skills: JSON.stringify(parsedSkills), image };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch(err) { console.error(err); }
  };

  // ✅ PREVENT BLANK SCREEN WHILE LOADING USER
  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Mentor Workspace...</h2>
      </div>
    );
  }

  // Dynamically derive unique list of students from real bookings
  const activeStudents = [];
  const uniqueStudentEmails = new Set();
  bookings.forEach(b => {
    if (!uniqueStudentEmails.has(b.studentEmail)) {
      uniqueStudentEmails.add(b.studentEmail);
      activeStudents.push({
        id: b.id,
        name: b.studentName,
        email: b.studentEmail
      });
    }
  });

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

            {bookings.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No sessions currently scheduled with you.</p>
            ) : (
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
            )}
          </div>
        )}

        {/* STUDENTS */}
        {view === "students" && (
          <div className="dashboard-view">
            <h2>👨‍🎓 Active MUBAS Students</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>Students who have established peer tracking history records with your profile.</p>

            {activeStudents.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No active students yet.</p>
            ) : (
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
            )}
          </div>
        )}

        {/* AVAILABILITY */}
        {view === "availability" && (
          <div className="dashboard-view">
            <h2>⏰ Setup Calendar Slots</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>Publish weekly recurring timeline blocks for students to choose when scheduling.</p>

            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              <form onSubmit={handlePublishSlot} style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px", height: "fit-content" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Day of the Week</label>
                  <select 
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} 
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Start Time</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} 
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>End Time</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} 
                  />
                </div>

                <button type="submit" style={{ width: "100%", padding: "12px", background: "#9c27b0", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                  Publish Time Block
                </button>
              </form>

              <div style={{ flex: 1, minWidth: "300px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                <h3>Active Availability Slots</h3>
                {availabilityList.length === 0 ? (
                  <p style={{ color: "#666", marginTop: "15px", fontSize: "14px" }}>No active availability slots. Add one using the form.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    {availabilityList.map((slot) => (
                      <div key={slot.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9f9f9", borderRadius: "6px", borderLeft: "4px solid #9c27b0" }}>
                        <div style={{ textAlign: "left" }}>
                          <strong>🗓️ {slot.day_of_week}</strong>
                          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
                            ⏰ {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          style={{ background: "#ff4d4d", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && (
          <div className="dashboard-view">
            <h2>⚙️ Profile Control</h2>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              <form onSubmit={handleSaveProfile} style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", width: "100%", maxWidth: "500px", textAlign: "left" }}>
                <h3>Update Portrait Details</h3>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>This information is shown to students booking sessions with you.</p>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Mentor Title / Specialization</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Fullstack Developer" 
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Profile Image URL</label>
                  <input 
                    type="text" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    placeholder="e.g. https://example.com/avatar.jpg" 
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Skills (comma separated)</label>
                  <input 
                    type="text" 
                    value={skillsInput} 
                    onChange={(e) => setSkillsInput(e.target.value)} 
                    placeholder="e.g. React, Node.js, SQL" 
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Biography / Intro</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Describe your mentorship style and target technologies..." 
                    rows="4"
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontFamily: "inherit", resize: "none" }}
                  />
                </div>

                <button type="submit" style={{ width: "100%", padding: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                  Save Profile Details
                </button>
              </form>

              <div className="profile-card" style={{ maxWidth: "400px", flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", height: "fit-content", textAlign: "left" }}>
                <h3>Account Information</h3>
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
          </div>
        )}

      </div>
    </div>
  );
}