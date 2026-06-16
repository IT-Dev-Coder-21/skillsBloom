import API_BASE_URL from "./config"; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Mentors() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA FROM DATABASE
  useEffect(() => {
    fetch(`${API_BASE_URL}/mentors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mentors");
        return res.json();
      })
      .then((data) => {
        // Format the data from the DB
        const dynamicMentors = data.map(m => {
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
            bio: m.bio || "Industry Expert",
            image: m.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
            skills: parsedSkills
          };
        });
        setMentors(dynamicMentors);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching mentors:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header>
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1>🌱 Skills Bloom</h1>
          </Link>
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/mentors">Meet Our Mentors</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
      </header>

      {/* MENTORS GRID */}
      <section className="mentors-section" style={{ padding: '50px 0' }}>
        <div className="container">
          <h2>Meet Our Mentors</h2>
          <div className="mentors-grid">
            {isLoading ? (
              <p>Loading mentors...</p>
            ) : mentors.length === 0 ? (
              <p>No mentors currently available.</p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card" style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                  <h3>{mentor.name}</h3>
                  <p className="mentor-role-title"><strong>{mentor.role}</strong></p>
                  <small>{mentor.bio}</small>
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {mentor.skills.map((skill, sIdx) => (
                        <span key={sIdx} style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
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
    </>
  );
}