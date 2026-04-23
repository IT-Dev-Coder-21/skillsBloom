import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Mentors() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ FIX ADDED HERE

  const mentors = [
    {
      name: "Alice Musukwa",
      role: "Fullstack Developer",
      bio: "Helping students build modern websites and applications with cutting-edge technologies.",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQFLDhUysNv2Sw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1724589862011?e=1778112000&v=beta&t=W2hDEVpF-98YvX9gMf4lmaN0hbqk4RX_TlWb0n4NEtI",
      skills: ["React", "Node.js", "Python", "AWS"]
    },
    {
      name: "Sana Abbas",
      role: "Fullstack Developer",
      bio: "Guiding students in Cisco networking, system administration, and full-stack development.",
      image: "https://media.licdn.com/dms/image/v2/C4D03AQEbMg9L9KcgaQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1638369937627?e=1778112000&v=beta&t=46y22cwrl6cFJ7Gya5YwZhYvDV-sdC168wRpz4s5AD0",
      skills: ["JavaScript", "Cisco", "Networking", "DevOps"]
    },
    {
      name: "Caroline Mutemi",
      role: "Software Developer",
      bio: "Designing beautiful user experiences and building scalable web applications.",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQEK-u9ItzSbiA/profile-displayphoto-scale_400_400/B4EZsqjqDtIwAg-/0/1765945552870?e=1778112000&v=beta&t=5mhiwkyJp66UV766y4yd2SGRxs3M41TK540zrMf_h18",
      skills: ["UI/UX", "React", "TypeScript", "Figma"]
    }
  ];

  return (
    <>
      {/* NAVBAR (UNCHANGED) */}
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
            <img src="https://th.bing.com/th/id/OIP.DRCGCITcKi7EU1R97su1YgHaJQ?w=144&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Skills Bloom Logo" />
          </div>
        </nav>
      </header>

      {/* HERO (UNCHANGED) */}
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
                <p>{mentor.role}</p>
                <small>{mentor.bio}</small>

                {/* ✅ FIXED BUTTON */}
                <button
                  className="book-btn"
                 onClick={() => navigate(`/bookings/${mentor.name}`)}
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER (UNCHANGED) */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>🌱 Skills Bloom</h3>
            <p>Empowering the next generation of developers</p>
          </div>
        </div>
      </footer>
    </>
  );
}