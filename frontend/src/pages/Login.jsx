import API_BASE_URL from "./config";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🛠️ Updated to handle the event object 'e' from form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevents the browser from reloading the page

    // 1. Basic required fields check
    if (!form.email || !form.password || (isRegister && !form.name)) {
      setStatusMessage({ text: "Please fill in all required fields! ⚠️", type: "error" });
      return;
    }

    // 2. 🔒 8-Character Password Validation
    if (isRegister && form.password.length < 8) {
      setStatusMessage({ text: "Password must be at least 8 characters long! 🔑", type: "error" });
      return;
    }

    const url = isRegister
      ? `${API_BASE_URL}/register`
      : `${API_BASE_URL}/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: `${data.message} 🚀`, type: "success" });

        if (isRegister && (form.role === "mentor" || form.role === "Mentor")) {
          setTimeout(() => {
            setForm({ name: "", email: "", password: "", role: "student" });
            setIsRegister(false); 
            setStatusMessage({ text: "", type: "" });
          }, 2500);
          return;
        }

        const loggedInUser = data.user;
        
        if (loggedInUser) {
          const userRole = loggedInUser.role ? loggedInUser.role.toLowerCase() : "";
          const isApproved = loggedInUser.is_approved;

          if (userRole === "mentor" && isApproved === 0) {
            setStatusMessage({ 
              text: "Your account is still pending admin approval. ⏳", 
              type: "error" 
            });
            return;
          }

          localStorage.setItem("user", JSON.stringify(loggedInUser));

          setForm({ name: "", email: "", password: "", role: "student" });

          setTimeout(() => {
            setStatusMessage({ text: "", type: "" });
            if (userRole === "admin") navigate("/admin-control");
            else if (userRole === "student") navigate("/student-dashboard");
            else if (userRole === "mentor") navigate("/mentor-dashboard");
            else navigate("/");
          }, 1500);
        }
      } else {
        setStatusMessage({ text: data.message || "Invalid credentials. ❌", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: "Server connection error — is the backend database running? 🖥️", type: "error" });
    }
  };

  return (
    <>
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

      <section className="login-hero">
        <div className="login-content">
          {/* 🛠️ CHANGED FROM <div> TO An ACTUAL <form> */}
          <form onSubmit={handleSubmit} className="auth-container">
            <h1>{isRegister ? "Create Account" : "Welcome"}</h1>
            
            {statusMessage.text && (
              <div style={{
                padding: "12px", borderRadius: "6px", marginBottom: "15px",
                backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee",
                color: statusMessage.type === "success" ? "#2e7d32" : "#c62828",
                border: statusMessage.type === "success" ? "1px solid #a5d6a7" : "1px solid #ef9a9a",
                textAlign: "center"
              }}>
                {statusMessage.text}
              </div>
            )}

            <select name="role" value={form.role} onChange={handleChange} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Platform Administrator</option>
            </select>

            {isRegister && (
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            )}

            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input 
              type="password" 
              name="password" 
              placeholder={isRegister ? "Password (min 8 chars)" : "Password"} 
              value={form.password} 
              onChange={handleChange}
              minLength={isRegister ? 8 : undefined}
              required
            />

            {/* 🛠️ CHANGED TO type="submit" */}
            <button type="submit" className="login-btn">{isRegister ? "Sign Up" : "Login"}</button>

            <p onClick={() => { setIsRegister(!isRegister); setStatusMessage({ text: "", type: "" }); }} 
               style={{ cursor: "pointer", marginTop: "15px" }}>
              {isRegister ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;