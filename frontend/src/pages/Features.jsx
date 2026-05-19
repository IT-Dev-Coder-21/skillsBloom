import { useState } from "react";
import { Link } from "react-router-dom";

export default function Features() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Condensed down to core high-value professional features
  const features = [
    {
      icon: "📅",
      title: "Smart Scheduling",
      description: "Book sessions with mentors at your convenience with our real-time interactive calendar availability system.",
      details: ["Real-time availability", "Automated tracking reminders", "Conflict detection"]
    },
    {
      icon: "👨‍🏫",
      title: "Expert Vetted Mentors",
      description: "Learn full-stack web development directly from experienced industry professionals and dedicated program mentors.",
      details: ["Vetted technical mentors", "Real-world development insight", "Focused 1-on-1 feedback"]
    },
    {
      icon: "📊",
      title: "Milestone Tracking",
      description: "Monitor your software engineering learning journey with clear dashboard progress logs and milestone completions.",
      details: ["Visual progress analytics", "Milestone achievements", "Goal-oriented logging"]
    },
    {
      icon: "💬",
      title: "Interactive Collaboration",
      description: "Engage in live technical mentoring sessions featuring screen sharing, collaborative coding, and detailed reviews.",
      details: ["Peer screen sharing", "In-depth code reviews", "Structured feedback tracking"]
    }
  ];

  return (
    <>
      {/* NAVBAR - Styled to match the clean layout of your dashboard project */}
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
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/mentors">Meet Our Mentors</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>

          <div className="codeblossom-logo">
            <img src="https://th.bing.com/th/id/OIP.SVdxgXyujak8uf6YzJ-segAAAA?w=150&h=150&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Skills Bloom Logo" />
          </div>
        </nav>
      </header>

      {/* FEATURES HERO - Cleaned and tightened layout */}
      <section className="features-hero" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="features-hero-content">
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Platform Ecosystem Features</h1>
          <p style={{ maxWidth: "600px", margin: "0 auto 25px auto", color: "#666" }}>
            Discover the comprehensive workspace tools that seamlessly link students to tracking mentors.
          </p>
          <div className="hero-stats" style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
            <div className="stat">
              <h3 style={{ margin: "0", fontSize: "24px" }}>4 Core</h3>
              <p style={{ margin: "0", fontSize: "14px", color: "#777" }}>Modules</p>
            </div>
            <div className="stat">
              <h3 style={{ margin: "0", fontSize: "24px" }}>100%</h3>
              <p style={{ margin: "0", fontSize: "14px", color: "#777" }}>Peer Alignment</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="features-section" style={{ padding: "30px 20px" }}>
        <div className="container">
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px", background: "#fff" }}>
                <div className="feature-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>{feature.icon}</span>
                  <h3 style={{ margin: "0", fontSize: "18px" }}>{feature.title}</h3>
                </div>
                <p className="feature-description" style={{ fontSize: "14px", color: "#55px", lineHeight: "1.5", marginBottom: "12px" }}>
                  {feature.description}
                </p>
                <ul className="feature-details" style={{ paddingLeft: "20px", fontSize: "13px", color: "#666" }}>
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} style={{ marginBottom: "4px" }}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* COMPACT CTA BLOCK */}
          <div className="features-cta" style={{ textAlign: "center", marginTop: "45px", padding: "25px", background: "#f9f9f9", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Ready to coordinate your tracking session?</h3>
            <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>Connect with a program leader or check scheduled records.</p>
            <div className="cta-buttons" style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <Link to="/login" className="btn primary">Get Started</Link>
              <Link to="/mentors" className="btn secondary">View Mentors</Link>
            </div>
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