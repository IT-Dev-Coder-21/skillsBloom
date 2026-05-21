require('dotenv').config();

console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Single, clean CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error ❌:", err);
  } else {
    console.log("MySQL Connected Successfully ✅");
  }
});

// NODEMAILER TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ROUTES
app.get("/test", (req, res) => res.send("Test works"));

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 
  const randomId = Math.floor(Math.random() * 999999);

  const sql = "INSERT INTO users (id, name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [randomId, name, email, password, normalizedRole, isApproved], (err, result) => {
    if (err) return res.status(500).json({ success: false, errorDetails: err.sqlMessage });
    res.json({ success: true, message: "User registered successfully ✅" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });
    if (result.length > 0 && result[0].password === password) {
      res.json({ success: true, message: "Login successful", user: result[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// --- ADMIN ROUTES ---
app.get("/admin/pending-mentors", (req, res) => {
  db.query("SELECT id, name, email FROM users WHERE role = 'mentor' AND is_approved = 0", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/admin/approve-mentor", (req, res) => {
  const { mentorId } = req.body;
  db.query("UPDATE users SET is_approved = 1 WHERE id = ?", [mentorId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Mentor authorized successfully!" });
  });
});

// BOOKING ROUTES
app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  const sql = "INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [studentName, studentEmail, mentorName, date, time || "N/A", objective || "Mentorship Session"], (err, result) => {
    if (err) return res.status(500).json({ success: false, errorDetails: err.message });

    // Send Email Notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: "New Mentorship Session Confirmed!",
      text: `Hello ${studentName},\n\nYour session with ${mentorName} is confirmed for ${date} at ${time}.\nObjective: ${objective}\n\nBest regards,\nSkills Bloom Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Email error:", error);
      else console.log("Email sent:", info.response);
    });

    res.status(200).json({ success: true, id: result.insertId });
  });
});

app.delete("/bookings/:id", (req, res) => {
  db.query("DELETE FROM bookings WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Session removed successfully! ✅" });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});