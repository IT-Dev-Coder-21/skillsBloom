import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [bookings, setBookings] = useState([]);

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

  // ✅ FIXED BOOKINGS FETCH (NO CRASH + SAFE ROUTE)
  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:5000/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // filter only this mentor’s bookings
          const filtered = data.filter(
            (b) => b.mentorName === user.name
          );
          setBookings(filtered);
        } else {
          setBookings([]);
        }
      })
      .catch((err) => {
        console.log("Bookings error:", err);
        setBookings([]);
      });
  }, [user]);

  // ✅ PREVENT BLANK SCREEN
  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Mentor Dashboard...</h2>
      </div>
    );
  }

  const students = [
    { id: 1, name: "Jane", progress: "Intermediate" },
    { id: 2, name: "John", progress: "Beginner" }
  ];

  return (
    <div className="dashboard-page">

      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <h2>Mentor Panel</h2>
        <h3>Welcome, {user.name} 👨‍🏫</h3>
      </div>

      {/* NAV */}
      <div className="dashboard-nav">
        <button onClick={() => setView("home")} className={view === "home" ? "active" : ""}>🏠 Overview</button>
        <button onClick={() => setView("sessions")} className={view === "sessions" ? "active" : ""}>📅 Sessions</button>
        <button onClick={() => setView("students")} className={view === "students" ? "active" : ""}>👨‍🎓 Students</button>
        <button onClick={() => setView("availability")} className={view === "availability" ? "active" : ""}>⏰ Availability</button>
        <button onClick={() => setView("profile")} className={view === "profile" ? "active" : ""}>⚙️ Profile</button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">

        {/* OVERVIEW */}
        {view === "home" && (
          <div>
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{bookings.length}</h3>
                <p>Upcoming Bookings</p>
              </div>

              <div className="stat-card">
                <h3>{students.length}</h3>
                <p>Active Students</p>
              </div>

              <div className="stat-card">
                <h3>4.9⭐</h3>
                <p>Rating</p>
              </div>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {view === "sessions" && (
          <div>
            <h2>📅 Booked Sessions</h2>

            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              bookings.map((b, i) => (
                <div key={i} className="session-card">
                  <h3>{b.studentName}</h3>
                  <p><b>Date:</b> {b.date} | {b.time}</p>
                  <p><b>Objective:</b> {b.objective}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* STUDENTS */}
        {view === "students" && (
          <div>
            <h2>👨‍🎓 My Students</h2>

            {students.map(s => (
              <div key={s.id} className="student-card">
                <h3>{s.name}</h3>
                <p>Level: {s.progress}</p>
                <button>Message</button>
              </div>
            ))}
          </div>
        )}

        {/* AVAILABILITY */}
        {view === "availability" && (
          <div>
            <h2>⏰ Set Availability</h2>

            <input type="date" />
            <input type="time" />

            <button style={{ marginTop: "10px" }}>
              Add Time Slot
            </button>
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && (
          <div>
            <h2>⚙️ Profile</h2>

            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> Mentor</p>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}