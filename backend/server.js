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
  if (err) console.log("MySQL Connection Error ❌:", err);
  else console.log("MySQL Connected Successfully ✅");
});

// 🚀 FIXED: HTTP API EMAIL FUNCTION
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
        sender: { 
          name: "Skills Bloom Team", 
          email: process.env.EMAIL_USER 
        },
        to: [{ email: to }],
        subject: subject,
        textContent: textContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Brevo API Rejected:", JSON.stringify(data, null, 2));
    } else {
      console.log(`Email successfully routed to ${to} ✅`);
    }
  } catch (error) {
    console.error("Failed to make email API request ❌:", error);
  }
}

// ROUTES
app.get("/", (req, res) => res.json({ message: "API is Live 🌸" }));

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: "Password too short." });
  }

  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 
  const randomId = Math.floor(Math.random() * 999999);

  const sql = "INSERT INTO users (id, name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [randomId, name, email, password, normalizedRole, isApproved], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.sqlMessage });

    // Send emails
    sendEmailViaHTTP({ to: "otanieljane@gmail.com", subject: "New Registration", textContent: `New user: ${name}` });
    sendEmailViaHTTP({ to: email, subject: "Welcome!", textContent: "Thanks for joining!" });

    res.json({ success: true, message: "Account created!" });
  });
});

app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  const findMentorSql = "SELECT email FROM users WHERE name = ? AND role = 'mentor' LIMIT 1";
  
  db.query(findMentorSql, [mentorName], (mentorErr, mentorResult) => {
    const mentorEmail = mentorResult.length > 0 ? mentorResult[0].email : null;
    const forcedBookingId = Math.floor(Date.now() % 1000000);

    const sql = "INSERT INTO bookings (id, studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [forcedBookingId, studentName, studentEmail, mentorName, date, time, objective], (err) => {
      if (err) return res.status(500).json({ success: false });

      sendEmailViaHTTP({ to: studentEmail, subject: "Booking Confirmed", textContent: "Session confirmed." });
      if (mentorEmail) sendEmailViaHTTP({ to: mentorEmail, subject: "New Booking", textContent: "New session." });

      res.status(200).json({ success: true, id: forcedBookingId });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));