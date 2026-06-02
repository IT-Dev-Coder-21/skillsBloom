import API_BASE_URL from "./config"; // ✅ Configuration bridge ready for live deployment synchronization
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Mentors() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate(); 

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

  useEffect(() => {
    fetch(`${API_BASE_URL}/mentors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mentors");
        return res.json();
      })
      .then((data) => {
        const dynamicMentors = data.map(m => {
          let parsedSkills = [];
          try {
            parsedSkills = typeof m.skills === 'string' ? JSON.parse(m.skills) : (Array.isArray(m.skills) ? m.skills : []);
          } catch(e) {
            parsedSkills = m.skills ? m.skills.split(',').map(s => s.trim()) : [];
          }
          return {
            name: m.name,
            role: m.title || "Faculty Mentor",
            bio: m.bio || "No biography provided yet.",
            image: m.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
            skills: parsedSkills
          };
        });

        const merged = [...hardcodedMentors];
        dynamicMentors.forEach(dm => {
          if (!merged.some(hm => hm.name.toLowerCase() === dm.name.toLowerCase())) {
            merged.push(dm);
          }
        });
        setMentors(merged);
      })
      .catch((err) => {
        console.error("Error fetching dynamic mentors:", err);
        setMentors(hardcodedMentors);
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
            {mentors.map((mentor, index) => (
              <div key={index} className="mentor-card">
                <img src={mentor.image} alt={mentor.name} />
                <h3>{mentor.name}</h3>
                <p className="mentor-role-title">{mentor.role}</p>
                <small>{mentor.bio}</small>

                {/* ✅ DYNAMIC SKILLS RENDER: Displaying the skills list as clean, stylized inline badges */}
                <div className="mentor-skills-container" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {mentor.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="skill-badge" style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
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