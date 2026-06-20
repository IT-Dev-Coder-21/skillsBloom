import API_BASE_URL from "./config"; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Mentors() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA FROM DATABASE
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/mentors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mentors");
        return res.json();
      })
      .then((data) => {
        const formattedMentors = data.map(m => {
          let parsedSkills = [];
          try {
            parsedSkills = typeof m.skills === 'string' ? JSON.parse(m.skills) : (Array.isArray(m.skills) ? m.skills : []);
          } catch(e) {
            parsedSkills = m.skills ? m.skills.split(',').map(s => s.trim()) : [];
          }
          return {
            id: m.id,
            name: m.name,
            role: m.title || "Faculty Mentor",
            bio: m.bio || "No biography provided yet.",
            // UPDATED: Use m.image_url from database, fallback to Unsplash if empty
            image: m.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
            skills: parsedSkills
          };
        });
        setMentors(formattedMentors);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching mentors:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <header>
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1>🌱 Skills Bloom</h1>
          </Link>
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="#features">Features</Link></li>
            <li><Link to="/mentors">Meet Our Mentors</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
      </header>

      <section className="mentors-hero">
        <div className="mentors-hero-content">
          <h1>Meet Our Expert Mentors</h1>
          <p>Learn from industry professionals who are passionate about sharing their knowledge and helping you grow in your tech career.</p>
        </div>
      </section>

      <section className="mentors-section">
        <div className="container">
          <h2>Meet Our Mentors</h2>
          <div className="mentors-grid">
            {isLoading ? (
              <p>Loading mentors...</p>
            ) : mentors.length === 0 ? (
              <p>No mentors currently available.</p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card">
                  <img src={mentor.image} alt={mentor.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                  <h3>{mentor.name}</h3>
                  <p className="mentor-role-title">{mentor.role}</p>
                  <small>{mentor.bio}</small>
                  {mentor.skills && mentor.skills.length > 0 && (
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