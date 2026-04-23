import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleSubmit = async () => {
    if (!form.email || !form.password || (isRegister && !form.name)) {
      alert("Fill all fields");
      return;
    }

    const url = isRegister
      ? "http://localhost:5000/register"
      : "http://localhost:5000/login";

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
        // SAVE USER
        localStorage.setItem("user", JSON.stringify(data.user));

        // RESET FORM
        setForm({
          name: "",
          email: "",
          password: "",
          role: "student"
        });

        // 🔥 ROLE-BASED REDIRECT (MAIN FIX)
        const role = data.user.role;

        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "mentor") {
          navigate("/mentor-dashboard");
        } else {
          navigate("/"); // fallback
        }

      } else {
        alert(data.message || "Something went wrong");
      }

    } catch (err) {
      console.error(err);
      alert("Server error - is backend running?");
    }
  };

  return (
    <>
      <header>
        <nav className="navbar">
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
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
            <img src="https://th.bing.com/th/id/OIP.SVdxgXyujak8uf6YzJ-segAAAA" />
          </div>
        </nav>
      </header>

      <section className="login-hero">
        <div className="login-overlay"></div>
        <div className="login-content">
          <div className="auth-container">
            <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>

            {isRegister && (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                />

                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <button onClick={handleSubmit} className="login-btn">
              {isRegister ? "Sign Up" : "Login"}
            </button>

            <p
              onClick={() => setIsRegister(!isRegister)}
              className="toggle-auth"
            >
              {isRegister
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </p>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 Skills Bloom</p>
      </footer>
    </>
  );
}

export default Login;