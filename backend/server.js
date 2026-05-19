console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ CORS POLICY: Dynamically accepts your live deployed frontend
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ DATABASE CONNECTION: Strictly uses Environment Variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error ❌:", err);
  } else {
    console.log("MySQL Connected Successfully ✅");
  }
});

// ✅ NODEMAILER CONFIGURATION
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "otanieljane@gmail.com", 
    pass: "heifetsbfttsbduc" 
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

  const sql = "INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [name, email, password, normalizedRole, isApproved], (err, result) => {
    if (err) return res.status(500).json({ success: false, errorDetails: err.message });
    
    if (normalizedRole === 'mentor') {
      return res.json({ success: true, message: "Registration successful! Pending approval. ⏳" });
    }
    res.json({ success: true, message: "User registered successfully ✅" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });
    if (result.length > 0) {
      res.json({ success: true, message: "Login successful", user: result[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

app.get("/bookings", (req, res) => {
  const sql = "SELECT id, studentName, studentEmail, mentorName, date, time, objective FROM bookings ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  const sql = "INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(sql, [studentName, studentEmail, mentorName, date, time || "N/A", objective || "Mentorship Session"], (err, result) => {
    if (err) return res.status(500).json({ success: false, errorDetails: err.message });
    res.status(200).json({ success: true, id: result.insertId });
  });
});

app.delete("/bookings/:id", (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  db.query("DELETE FROM bookings WHERE id = ?", [bookingId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Session removed successfully! ✅" });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});