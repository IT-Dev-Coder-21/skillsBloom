import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return navigate("/login");
    setUser(u);
  }, [navigate]);

  if (!user) return <div className="loading"><h2>Loading...</h2></div>;

  const mentors = [
    { id: 1, name: "Alice Musukwa", specialty: "Full Stack Development", expertise: "React, Node.js, MongoDB", image: "👩‍💻" },
    { id: 2, name: "Sana Abbas", specialty: "Networking & Security", expertise: "TCP/IP, Cybersecurity", image: "👨‍💻" },
    { id: 3, name: "James Chen", specialty: "Python & Data Science", expertise: "ML, AI, Data Analysis", image: "👨‍💻" },
  ];

  const courses = [
    { id: 1, title: "Web Development Basics", progress: 65, instructor: "Alice Musukwa" },
    { id: 2, title: "JavaScript Fundamentals", progress: 45, instructor: "James Chen" },
    { id: 3, title: "Advanced React Patterns", progress: 80, instructor: "Alice Musukwa" },
  ];

  return (
    <div className="dashboard-page">
      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <h2>CodeBlossom</h2>
        </div>
        <div className="topbar-center">
          <h1>Welcome back, {user.name}! 🎓</h1>
        </div>
        <div className="topbar-right">
          <span className="student-role">Student</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="dashboard-nav">
        <button 
          className={view === "home" ? "active" : ""} 
          onClick={() => setView("home")}
        >
          📚 Home
        </button>
        <button 
          className={view === "courses" ? "active" : ""} 
          onClick={() => setView("courses")}
        >
          📖 My Courses
        </button>
        <button 
          className={view === "mentors" ? "active" : ""} 
          onClick={() => setView("mentors")}
        >
          👨‍🏫 Mentors
        </button>
        <button 
          className={view === "profile" ? "active" : ""} 
          onClick={() => setView("profile")}
        >
          ⚙️ Profile
        </button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">

        {/* HOME VIEW */}
        {view === "home" && (
          <div className="dashboard-view">
            <div className="welcome-card">
              <h2>Start Your Learning Journey! 🚀</h2>
              <p>Explore courses, connect with mentors, and unlock your coding potential.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>3</h3>
                <p>Active Courses</p>
              </div>
              <div className="stat-card">
                <h3>{Math.round((65 + 45 + 80) / 3)}%</h3>
                <p>Average Progress</p>
              </div>
              <div className="stat-card">
                <h3>2</h3>
                <p>Mentors Connected</p>
              </div>
              <div className="stat-card">
                <h3>5</h3>
                <p>Hours This Week</p>
              </div>
            </div>

            <div className="quick-access">
              <h3>Quick Access</h3>
              <button className="quick-btn" onClick={() => setView("courses")}>View Courses →</button>
              <button className="quick-btn" onClick={() => setView("mentors")}>Browse Mentors →</button>
            </div>
          </div>
        )}

        {/* COURSES VIEW */}
        {view === "courses" && (
          <div className="dashboard-view">
            <h2>📖 My Courses</h2>
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className="instructor">{course.instructor}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${course.progress}%`}}></div>
                  </div>
                  <p className="progress-text">{course.progress}% Complete</p>
                  <button className="continue-btn">Continue Learning</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENTORS VIEW */}
        {view === "mentors" && (
          <div className="dashboard-view">
            <h2>👨‍🏫 Connect with Mentors</h2>
            <p className="section-desc">Learn from experienced mentors in your field of interest</p>
            <div className="mentors-grid">
              {mentors.map(mentor => (
                <div key={mentor.id} className="mentor-card">
                  <div className="mentor-avatar">{mentor.image}</div>
                  <h3>{mentor.name}</h3>
                  <p className="specialty">{mentor.specialty}</p>
                  <p className="expertise">{mentor.expertise}</p>
                  <button className="connect-btn">Connect</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {view === "profile" && (
          <div className="dashboard-view">
            <div className="profile-card">
              <h2>My Profile</h2>
              <div className="profile-info">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Account Type</label>
                  <p>Student</p>
                </div>
              </div>
              <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}