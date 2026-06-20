require('dotenv').config();

console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// DATABASE CONNECTION
const db = !process.env.DB_HOST
  ? require("./dbMock")
  : mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      ssl: { rejectUnauthorized: false }
    });

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error ❌:", err);
  } else {
    console.log("MySQL Connected Successfully ✅");
    db.query(`CREATE TABLE IF NOT EXISTS mentor_availability (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mentor_email VARCHAR(255),
      available_date VARCHAR(50),
      available_time VARCHAR(50),
      is_booked BOOLEAN DEFAULT FALSE
    )`, (err) => {
      if (err) console.error("Table creation error:", err);
      else console.log("Mentor Availability table is ready! ✅");
    });
  }
});

// 🚀 CLOUD-FRIENDLY HTTP EMAIL FUNCTION
async function sendEmailViaHTTP({ to, subject, textContent }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Skills Bloom Team", email: process.env.EMAIL_USER }, 
        to: [{ email: to }],
        subject: subject,
        textContent: textContent
      })
    });
    const data = await response.json();
    if (!response.ok) console.log("Brevo API Delivery Issue ❌:", data);
  } catch (error) { console.error("Failed to make email API request ❌:", error); }
}

// --- ALL ORIGINAL ROUTES ---
app.get("/api/mentors", (req, res) => {
  const sql = "SELECT id, name, email, role, image, bio, title, skills FROM users WHERE role = 'mentor'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/test", (req, res) => res.send("Test works"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Skills Bloom API Server! 🌸", status: "Active" });
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

// REGISTRATION & LOGIN
app.post("/register", (req, res) => {
  const { name, email, password, role, image } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ success: false, message: "Password too short." });
  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    const sql = "INSERT INTO users (name, email, password, role, is_approved, image) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, normalizedRole, isApproved, image || null], (err) => {
      if (err) return res.status(500).json({ success: false, errorDetails: err.message });
      res.json({ success: true, message: "Account created successfully! 📥" });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (result.length > 0 && await bcrypt.compare(password, result[0].password)) {
      res.json({ success: true, user: result[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// ADMIN & BOOKING ROUTES
app.get("/admin/pending-mentors", (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE role = 'mentor' AND is_approved = 0", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/admin/approve-mentor", (req, res) => {
  const { mentorId } = req.body;
  db.query("UPDATE users SET is_approved = 1 WHERE id = ?", [mentorId], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  const sql = "INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [studentName, studentEmail, mentorName, date, time, objective], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// AVAILABILITY ROUTES
app.post("/mentor/add-slot", (req, res) => {
  const { email, date, time } = req.body;
  const sql = "INSERT INTO mentor_availability (mentor_email, available_date, available_time) VALUES (?, ?, ?)";
  db.query(sql, [email, date, time], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

app.get("/mentor/slots/:email", (req, res) => {
  const sql = "SELECT * FROM mentor_availability WHERE mentor_email = ? AND is_booked = FALSE";
  db.query(sql, [req.params.email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/mentor/slots/:id", (req, res) => {
  db.query("DELETE FROM mentor_availability WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.delete("/bookings/:id", (req, res) => {
  db.query("DELETE FROM bookings WHERE id = ?", [req.params.id], (err) => {
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});