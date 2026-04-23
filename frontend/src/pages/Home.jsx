import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/mentors">Meet Our Mentors</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>

          <div className="codeblossom-logo">
            <img src="https://th.bing.com/th/id/OIP.SVdxgXyujak8uf6YzJ-segAAAA?w=150&h=150&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Skills Bloom Logo" />
          </div>
        </nav>
      </header>

      {/* FULL-SCREEN HERO */}
      <section className="hero-fullscreen">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Unlock Your <span className="highlight">Coding Potential</span>
            </h1>
            <p className="hero-subtitle">
              Connect with expert mentors, master new skills, and accelerate your career in tech.
              Join a community of learners and professionals committed to growth and excellence.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn primary">Start Your Journey</Link>
              <Link to="/about" className="btn secondary">Learn More</Link>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Students Mentored</p>
            </div>
            <div className="stat">
              <h3>50+</h3>
              <p>Expert Mentors</p>
            </div>
            <div className="stat">
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <p>Scroll to explore</p>
        </div>
      </section>

      {/* FEATURES PREVIEW */}
      <section id="features" className="features-preview">
        <div className="container">
          <h2>Why Choose Skills Bloom?</h2>
          <p className="section-subtitle">Discover the powerful features that make learning with us exceptional</p>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📅</div>
              <h3>Smart Scheduling</h3>
              <p>Book sessions with mentors at your convenience with our intelligent scheduling system that adapts to your timezone and availability.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Expert Mentors</h3>
              <p>Learn from industry professionals with years of experience in various tech fields, from web development to data science.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed analytics, milestone achievements, and personalized learning recommendations.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>Live Sessions</h3>
              <p>Engage in interactive live mentoring sessions with screen sharing, code reviews, and real-time collaboration tools.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <h3>Resource Library</h3>
              <p>Access a comprehensive library of learning materials, tutorials, and resources curated by our expert mentors.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Get customized learning paths and recommendations based on your goals, skill level, and learning preferences.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏆</div>
              <h3>Certification</h3>
              <p>Earn recognized certificates upon completing mentorship programs and skill assessments.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <h3>Global Community</h3>
              <p>Connect with learners and mentors from around the world, building a diverse and supportive learning community.</p>
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