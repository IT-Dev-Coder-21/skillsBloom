require('dotenv').config();

console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

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
    if (!response.ok) {
      console.log("Brevo API Delivery Issue ❌:", data);
    } else {
      console.log(`Email successfully routed to ${to} via HTTP API ✅`);
    }
  } catch (error) {
    console.error("Failed to make email API request ❌:", error);
  }
}

// --- NEW ROUTE FOR MENTORS PAGE ---
app.get("/api/approved-mentors", (req, res) => {
  const sql = "SELECT id, name, email, role FROM users WHERE role = 'mentor' AND is_approved = 1";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ROUTES
app.get("/test", (req, res) => res.send("Test works"));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Skills Bloom API Server! 🌸",
    status: "Active & Connected to Render Database",
    version: "1.0.0"
  });
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      message: "Registration rejected: Password must be at least 8 characters long! 🔑" 
    });
  }

  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 
  const randomId = Math.floor(Math.random() * 999999);

  const sql = "INSERT INTO users (id, name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [randomId, name, email, password, normalizedRole, isApproved], (err, result) => {
    if (err) return res.status(500).json({ success: false, errorDetails: err.sqlMessage });

    sendEmailViaHTTP({
      to: "otanieljane@gmail.com",
      subject: "🚨 New User Registration Alert - Skills Bloom",
      textContent: `Hello Admin,\n\nA new user has registered!\n- Name: ${name}\n- Email: ${email}\n- Role: ${normalizedRole}`
    });

    sendEmailViaHTTP({
      to: email,
      subject: "Welcome to Skills Bloom! 🌱",
      textContent: `Hello ${name},\n\nThank you for registering! Please wait for official confirmation.`
    });

    res.json({ success: true, message: "Account created successfully! 📥" });
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

app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  const findMentorSql = "SELECT email FROM users WHERE name = ? AND role = 'mentor' LIMIT 1";
  
  db.query(findMentorSql, [mentorName], (mentorErr, mentorResult) => {
    let mentorEmail = mentorResult?.length > 0 ? mentorResult[0].email : null;
    const forcedBookingId = Math.floor(Date.now() % 1000000) + Math.floor(Math.random() * 1000);

    const sql = "INSERT INTO bookings (id, studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [forcedBookingId, studentName, studentEmail, mentorName, date, time || "N/A", objective || "Mentorship Session"], (err, result) => {
      if (err) return res.status(500).json({ success: false, errorDetails: err.message });

      sendEmailViaHTTP({
        to: studentEmail, 
        subject: "Your Mentorship Session is Confirmed! 🎉",
        textContent: `Hello ${studentName}, your session with ${mentorName} is confirmed.`
      });

      if (mentorEmail) {
        sendEmailViaHTTP({
          to: mentorEmail,
          subject: "New Mentorship Booking Notification! 📅",
          textContent: `New booking from ${studentName}.`
        });
      }
      res.status(200).json({ success: true, id: forcedBookingId });
    });
  });
});

app.post("/mentor/add-slot", (req, res) => {
  const { email, date, time } = req.body;
  const sql = "INSERT INTO mentor_availability (mentor_email, available_date, available_time) VALUES (?, ?, ?)";
  db.query(sql, [email, date, time], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Slot added successfully!" });
  });
});

app.get("/mentor/slots/:email", (req, res) => {
  const sql = "SELECT * FROM mentor_availability WHERE mentor_email = ? AND is_booked = FALSE";
  db.query(sql, [req.params.email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
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