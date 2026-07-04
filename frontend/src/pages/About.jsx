import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// 🌟 REPETITIVE SCROLL-TRIGGERED ANIMATED COUNTER
function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }

        if (entry.isIntersecting) {
          let startTimestamp = null;
          
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const easeOutQuad = progress * (2 - progress);
            setCount(Math.floor(easeOutQuad * target));

            if (progress < 1) {
              animationFrameRef.current = window.requestAnimationFrame(step);
            }
          };
          
          animationFrameRef.current = window.requestAnimationFrame(step);
        } else {
          setCount(0); // Reset to 0 when it scrolls out of view
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration]);

  return <h3 ref={elementRef}>{count}{suffix}</h3>;
}

export default function About() {
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

      {/* ABOUT HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Skills Bloom</h1>
          <p className="about-subtitle">Empowering the next generation of developers through mentorship and collaboration</p>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <section className="about-content">
        <div className="about-container">
          <div className="about-mission">
            <h2>Our Mission</h2>
            <p>
              Skills Bloom is a comprehensive mentorship platform designed to bridge the gap between aspiring developers
              and experienced professionals. We believe that everyone deserves access to quality mentorship, regardless
              of their background or location.
            </p>
            <p>
              Our platform connects students with mentors, allowing them to schedule sessions, track progress,
              and grow professionally in a supportive environment.
            </p>
          </div>

          <div className="about-values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>🌱 Growth</h3>
                <p>Continuous learning and personal development for both mentors and students.</p>
              </div>
              <div className="value-card">
                <h3>🤝 Collaboration</h3>
                <p>Building strong relationships between mentors and students through shared knowledge.</p>
              </div>
              <div className="value-card">
                <h3>🎯 Excellence</h3>
                <p>Striving for the highest quality in mentorship and educational experiences.</p>
              </div>
              <div className="value-card">
                <h3>🌍 Accessibility</h3>
                <p>Making quality mentorship available to everyone, everywhere.</p>
              </div>
            </div>
          </div>

          {/* ABOUT STATS WITH REPETITIVE LIVE COUNTERS */}
          <div className="about-stats">
            <h2>Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <AnimatedCounter target={5000} suffix="+" />
                <p>Students Mentored</p>
              </div>
              <div className="stat-item">
                <AnimatedCounter target={50} suffix="+" />
                <p>Expert Mentors</p>
              </div>
              <div className="stat-item">
                <AnimatedCounter target={1000} suffix="+" />
                <p>Sessions Completed</p>
              </div>
              <div className="stat-item">
                <AnimatedCounter target={95} suffix="%" />
                <p>Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="about-cta">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join our community of learners and mentors today.</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn primary">Get Started</Link>
          <Link to="/mentors" className="btn secondary">Meet Our Mentors</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>🌱 Skills Bloom</h3>
            <p>At Skills Bloom, we are dedicated to bridging the gap between ambitious students and experienced industry mentors. 
    Our mission is to foster a collaborative ecosystem where technical knowledge is shared, professional growth 
    is accelerated, and the next generation of innovators is empowered to solve real-world challenges.</p>
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