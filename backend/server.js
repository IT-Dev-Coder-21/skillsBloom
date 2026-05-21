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

// 🛠️ NODEMAILER TRANSPORTER (UPDATED: REMOVED service: 'gmail' TO FORCE IPv4)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Uses SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Strictly forces Node.js to use IPv4 only and prevents Nodemailer from defaulting to unreachable IPv6 links
  dnsLookup: (hostname, options, callback) => {
    require('dns').lookup(hostname, { family: 4 }, callback);
  }
});

// ROUTES
app.get("/test", (req, res) => res.send("Test works"));

// Root route to welcome visitors and prevent "Cannot GET /"
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

// REGISTRATION WITH EMAIL NOTIFICATIONS & PASSWORD SHIELD
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  // 🔒 BACKEND PASSWORD VALIDATION SHIELD
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

    // 📩 1. ALERT EMAIL TO YOU (The Admin)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "otanieljane@gmail.com",
      subject: "🚨 New User Registration Alert - Skills Bloom",
      text: `Hello Admin,\n\nA new user has registered on Skills Bloom!\n\nDetails:\n- Name: ${name}\n- Email: ${email}\n- Role: ${normalizedRole}\n- Account Status: ${isApproved === 1 ? 'Automatically Approved' : 'Pending Admin Approval'}\n\nBest regards,\nYour Server`
    };

    transporter.sendMail(adminMailOptions, (error) => {
      if (error) console.log("Admin notification email error ❌:", error);
    });

    // 📩 2. WELCOME/WAIT EMAIL TO THE REGISTERED USER
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Sends directly to the user's input email
      subject: "Welcome to Skills Bloom! 🌱 Account Received",
      text: `Hello ${name},\n\nThank you for registering an account with Skills Bloom as a ${normalizedRole}!\n\nYour details have been successfully received. Please wait for your official confirmation email from our team before attempting to log in.\n\nWe look forward to blooming with you!\n\nBest regards,\nSkills Bloom Team 🌸`
    };

    transporter.sendMail(userMailOptions, (error) => {
      if (error) console.log("User welcome email error ❌:", error);
    });

    // Send successful response with your custom message back to React
    res.json({ 
      success: true, 
      message: "Account created successfully! Please check your inbox and wait for your confirmation email. 📥" 
    });
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
  
  const findMentorSql = "SELECT email FROM users WHERE name = ? AND role = 'mentor' LIMIT 1";
  
  db.query(findMentorSql, [mentorName], (mentorErr, mentorResult) => {
    let mentorEmail = null;
    if (!mentorErr && mentorResult.length > 0) {
      mentorEmail = mentorResult[0].email;
    }

    // Generate a numeric ID using the current time milliseconds
    const forcedBookingId = Math.floor(Date.now() % 1000000) + Math.floor(Math.random() * 1000);

    const sql = "INSERT INTO bookings (id, studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [forcedBookingId, studentName, studentEmail, mentorName, date, time || "N/A", objective || "Mentorship Session"], (err, result) => {
      if (err) return res.status(500).json({ success: false, errorDetails: err.message });

      // Fixed 'to' address value to send mail to the student correctly
      const studentMailOptions = {
        from: process.env.EMAIL_USER,
        to: studentEmail, 
        subject: "Your Mentorship Session is Confirmed! 🎉",
        text: `Hello ${studentName},\n\nYour session with ${mentorName} is confirmed for ${date} at ${time}.\nObjective: ${objective}\n\nBest regards,\nSkills Bloom Team`
      };

      transporter.sendMail(studentMailOptions, (error) => {
        if (error) console.log("Student email error:", error);
      });

      // Fixed 'to' address value to send mail to the mentor correctly
      if (mentorEmail) {
        const mentorMailOptions = {
          from: process.env.EMAIL_USER,
          to: mentorEmail,
          subject: "New Mentorship Booking Notification! 📅",
          text: `Hello ${mentorName},\n\nA student has booked a session with you!\n\nDetails:\n- Student Name: ${studentName}\n- Date: ${date}\n- Time: ${time}\n- Objective: ${objective}\n\nPlease prepare accordingly.\n\nBest regards,\nSkills Bloom Team`
        };

        transporter.sendMail(mentorMailOptions, (error) => {
          if (error) console.log("Mentor email error:", error);
        });
      }

      res.status(200).json({ success: true, id: forcedBookingId });
    });
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