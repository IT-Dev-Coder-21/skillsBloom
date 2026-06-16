import API_BASE_URL from "./config"; 
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Mentors() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mentors, setMentors] = useState([]); // ✅ Changed from array to empty state
  const navigate = useNavigate(); 

  // ✅ FETCH DATA FROM DATABASE ON LOAD
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/approved-mentors`)
      .then(res => res.json())
      .then(data => setMentors(data))
      .catch(err => console.log("Error loading mentors:", err));
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header>
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1>🌱 Skills Bloom</h1>
          </Link>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>

          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="#features">Features</Link></li>
            <li><Link to="/mentors">Meet Our Mentors</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>

          <div className="codeblossom-logo">
            <img src="https://th.bing.com/th/id/OIP.SVdxgXyujak8uf6YzJ-segAAAA?w=150&h=150&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Skills Bloom Logo" />
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mentors-hero">
        <div className="mentors-hero-content">
          <h1>Meet Our Expert Mentors</h1>
          <p>Learn from industry professionals who are passionate about sharing their knowledge and helping you grow in your tech career.</p>
        </div>
      </section>

      {/* MENTORS GRID */}
      <section className="mentors-section">
        <div className="container">
          <h2>Meet Our Mentors</h2>

          <div className="mentors-grid">
            {mentors.length === 0 ? (
              <p>No mentors currently available.</p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card">
                  {/* Note: If your DB doesn't have image/bio yet, you can add them later */}
                  <h3>{mentor.name}</h3>
                  <p className="mentor-role-title">{mentor.role || "Mentor"}</p>
                  <small>{mentor.bio || "Industry Expert"}</small>
                  
                  {/* Skill badges only if skills exist */}
                  {mentor.skills && (
                    <div className="mentor-skills-container" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                      {mentor.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="skill-badge" style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>🌱 Skills Bloom</h3>
            <p>Empowering the next generation of developers</p>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/features">Features</Link>
            <Link to="/mentors">Meet Our Mentors</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Skills Bloom | Powered by Code Blossom 🌸</p>
        </div>
      </footer>
    </>
  );
}