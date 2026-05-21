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
        // Cancel any ongoing animation frame to prevent overlapping loops
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }

        if (entry.isIntersecting) {
          // 🚀 START ANIMATING WHEN IT ENTERS THE SCREEN
          let startTimestamp = null;
          
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function to make the counting slow down nicely near the end
            const easeOutQuad = progress * (2 - progress);
            setCount(Math.floor(easeOutQuad * target));

            if (progress < 1) {
              animationFrameRef.current = window.requestAnimationFrame(step);
            }
          };
          
          animationFrameRef.current = window.requestAnimationFrame(step);
        } else {
          // 🔄 RESET TO 0 WHEN IT SCROLLS OUT OF VIEW
          setCount(0);
        }
      },
      { threshold: 0.1 } // Starts animating when 10% of the card is visible
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

      {/* FULL-SCREEN HERO WITH REPETITIVE COUNTERS */}
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
              <AnimatedCounter target={5000} suffix="+" />
              <p>Students Mentored</p>
            </div>
            <div className="stat">
              <AnimatedCounter target={50} suffix="+" />
              <p>Expert Mentors</p>
            </div>
            <div className="stat">
              <AnimatedCounter target={95} suffix="%" />
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

      {/* STREAMLINED FEATURES PREVIEW */}
      <section id="features" className="features-preview">
        <div className="container">
          <h2>Why Choose Skills Bloom?</h2>
          <p className="section-subtitle">Discover the core pillars that make learning with us exceptional</p>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Expert 1-on-1 Mentorship</h3>
              <p>Learn directly from industry professionals through personalized paths tailored exactly to your coding goals and pacing.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>Live Interactive Coding</h3>
              <p>Engage in real-time pairing sessions with live screen-sharing, expert architectural code reviews, and fast troubleshooting.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📅</div>
              <h3>Smart Flexible Scheduling</h3>
              <p>Book matching consultation slots effortlessly with an intelligent layout tailored completely around your daily schedule.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Milestone Progress Dashboards</h3>
              <p>Track your technical expansion easily using metric performance graphs, project checkmarks, and targeted skill assessments.</p>
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