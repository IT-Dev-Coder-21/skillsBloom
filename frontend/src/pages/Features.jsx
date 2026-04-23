import { useState } from "react";
import { Link } from "react-router-dom";

export default function Features() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: "📅",
      title: "Smart Scheduling",
      description: "Book sessions with mentors at your convenience with our intelligent scheduling system that adapts to your timezone and availability. Never miss a session with automated reminders and conflict detection.",
      details: ["Timezone-aware scheduling", "Automated reminders", "Conflict detection", "Flexible rescheduling"]
    },
    {
      icon: "👨‍🏫",
      title: "Expert Mentors",
      description: "Learn from industry professionals with years of experience in various tech fields, from web development to data science. Our mentors are carefully vetted and trained.",
      details: ["Industry professionals", "Multi-domain expertise", "Vetted and trained", "Real-world experience"]
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics, milestone achievements, and personalized learning recommendations tailored to your goals.",
      details: ["Detailed analytics", "Milestone tracking", "Personalized recommendations", "Goal-oriented learning"]
    },
    {
      icon: "💬",
      title: "Live Sessions",
      description: "Engage in interactive live mentoring sessions with screen sharing, code reviews, and real-time collaboration tools for an immersive learning experience.",
      details: ["Screen sharing", "Code reviews", "Real-time collaboration", "Interactive whiteboard"]
    },
    {
      icon: "📚",
      title: "Resource Library",
      description: "Access a comprehensive library of learning materials, tutorials, and resources curated by our expert mentors and updated regularly.",
      details: ["Curated content", "Regular updates", "Multiple formats", "Searchable database"]
    },
    {
      icon: "🎯",
      title: "Personalized Learning",
      description: "Get customized learning paths and recommendations based on your goals, skill level, and learning preferences with AI-powered suggestions.",
      details: ["AI-powered recommendations", "Skill assessment", "Custom learning paths", "Adaptive content"]
    },
    {
      icon: "🏆",
      title: "Certification",
      description: "Earn recognized certificates upon completing mentorship programs and skill assessments, validated by industry experts.",
      details: ["Industry-recognized", "Skill validation", "Digital certificates", "Portfolio building"]
    },
    {
      icon: "🌐",
      title: "Global Community",
      description: "Connect with learners and mentors from around the world, building a diverse and supportive learning community with networking opportunities.",
      details: ["Global networking", "Diverse community", "Peer learning", "Cultural exchange"]
    },
    {
      icon: "🔒",
      title: "Secure Platform",
      description: "Your data and sessions are protected with enterprise-grade security, ensuring a safe and private learning environment.",
      details: ["End-to-end encryption", "Secure payments", "Privacy protection", "Data security"]
    },
    {
      icon: "📱",
      title: "Mobile Learning",
      description: "Access your learning materials and schedule sessions on-the-go with our responsive mobile app and web platform.",
      details: ["Mobile app", "Responsive design", "Offline access", "Cross-platform sync"]
    },
    {
      icon: "💰",
      title: "Flexible Pricing",
      description: "Choose from various pricing plans designed to fit different learning needs and budgets, with no hidden fees.",
      details: ["Multiple plans", "Transparent pricing", "No hidden fees", "Flexible subscriptions"]
    },
    {
      icon: "🎓",
      title: "Career Support",
      description: "Get career guidance, resume reviews, and interview preparation from experienced mentors to accelerate your professional growth.",
      details: ["Career guidance", "Resume reviews", "Interview prep", "Job placement support"]
    }
  ];

  return (
    <>
      {/* NAVBAR */}
      <header>
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <img src="https://th.bing.com/th/id/OIP.SVdxgXyujak8uf6YzJ-segAAAA?w=150&h=150&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Skills Bloom Logo" className="navbar-logo" />
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

      {/* FEATURES HERO */}
      <section className="features-hero">
        <div className="features-overlay"></div>
        <div className="features-hero-content">
          <h1>Powerful Features for Exceptional Learning</h1>
          <p>Discover the comprehensive tools and features that make Skills Bloom the ultimate platform for mentorship and skill development.</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>12+</h3>
              <p>Core Features</p>
            </div>
            <div className="stat">
              <h3>100%</h3>
              <p>User Satisfaction</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="features-section">
        <div className="container">
          <div className="features-intro">
            <h2>Everything You Need to Succeed</h2>
            <p>Our platform combines cutting-edge technology with expert mentorship to deliver an unparalleled learning experience.</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-details">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="features-cta">
            <h3>Ready to Experience These Features?</h3>
            <p>Join thousands of learners who are already transforming their careers with Skills Bloom.</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn primary">Start Your Journey</Link>
              <Link to="/mentors" className="btn secondary">Meet Our Mentors</Link>
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