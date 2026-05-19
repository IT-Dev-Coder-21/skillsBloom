console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ FIX 1: DYNAMIC CORS POLICY CONFIGURATION
// This allows your production Vercel frontend link to communicate with your backend securely!
app.use(cors({
  origin: true, // Dynamically accepts your live deployed domains
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ FIX 2: ENVIRONMENT-DRIVEN DATABASE CONNECTION
// When on Render, it will use your secure live cloud database credentials.
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "JANE2005",
  database: process.env.DB_NAME || "skillsbloom",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error ❌:", err);
  } else {
    console.log("MySQL Connected Successfully ✅");
  }
});

// ✅ NODEMAILER EMAIL DISPATCH CONFIGURATION
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "otanieljane@gmail.com", 
    pass: "heifetsbfttsbduc" 
  }
});

// TEST ROUTE
app.get("/test", (req, res) => {
  res.send("Test works");
});

// GET ALL USERS
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

// GET QUESTIONS
app.get("/questions", (req, res) => {
  db.query("SELECT * FROM questions", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

// GET ATTENDANCE LOGS
app.get("/attendance", (req, res) => {
  db.query("SELECT * FROM session_attendance", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

// REGISTER NEW ACCOUNT ROUTE
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  
  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 

  const sql = "INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [name, email, password, normalizedRole, isApproved], (err, result) => {
    if (err) {
      console.log("❌ REGISTRATION DATABASE ERROR:", err.message);
      return res.status(500).json({ success: false, message: "Registration failed", errorDetails: err.message });
    }
    
    if (normalizedRole === 'mentor') {
      return res.json({
        success: true,
        message: "Registration successful! Account pending admin approval. ⏳",
        user: null
      });
    }

    res.json({
      success: true,
      message: "User registered successfully ✅",
      user: { name, email, role: normalizedRole }
    });
  });
});

// SECURE USER LOGIN ROUTE
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Server error during validation login." });
    }
    if (result.length > 0) {
      const user = result[0];
      res.json({
        success: true,
        message: "Login successful",
        user
      });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials"
      });
    }
  });
});

// ✅ UNIFIED ENTIRE BOOKINGS/SESSIONS DATA DISPATCH
app.get("/bookings", (req, res) => {
  const sql = "SELECT id, studentName, studentEmail, mentorName, date, time, objective FROM bookings ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ FETCH BOOKINGS ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.send(result);
  });
});

app.get("/sessions", (req, res) => {
  const sql = "SELECT id, studentName, studentEmail, mentorName, date, time, objective FROM bookings ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send(result);
  });
});

// BOOKINGS POST ROUTE
app.post("/bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;

  console.log("📥 Incoming Booking Request Payload:", req.body);

  const lookupSql = "SELECT email FROM users WHERE name = ? AND role = 'mentor' LIMIT 1";

  db.query(lookupSql, [mentorName], (lookupErr, lookupResult) => {
    let mentorEmail = "otanieljane@gmail.com"; 

    if (!lookupErr && lookupResult.length > 0) {
      mentorEmail = lookupResult[0].email;
    }

    const sql = `
      INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [studentName, studentEmail, mentorName, date, time || "N/A", objective || "Mentorship Session"], (err, result) => {
      if (err) {
        console.error("❌ CRITICAL DATABASE SYSTEM INSERT ERROR:", err.message);
        return res.status(500).json({ 
          success: false, 
          errorDetails: err.message 
        });
      }

      console.log("🚀 Data committed cleanly to SQL schema!");

      const mentorMailOptions = {
        from: '"Skills Bloom Platform" <otanieljane@gmail.com>',
        to: mentorEmail,
        subject: "🌱 New Mentorship Session Booked!",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #4CAF50; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Booking Request</h2>
            <p>Hello <strong>${mentorName}</strong>,</p>
            <p>A student has scheduled a tracking session with you. Here are the session details:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p style="margin: 5px 0;"><strong>Student Name:</strong> ${studentName}</p>
              <p style="margin: 5px 0;"><strong>Student Email:</strong> ${studentEmail}</p>
              <p style="margin: 5px 0;"><strong>Scheduled Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Scheduled Time:</strong> ${time || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>Session Objective:</strong> ${objective || "Mentorship Session"}</p>
            </div>
            <p style="font-size: 12px; color: #777;">Please review your dashboard timeline prior to the meeting.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;">
            <p style="font-size: 11px; color: #aaa; text-align: center;">🌸 Powered by Code Blossom</p>
          </div>
        `
      };

      const studentMailOptions = {
        from: '"Skills Bloom Platform" <otanieljane@gmail.com>',
        to: studentEmail, 
        subject: "🌱 Booking Confirmed: Your Skills Bloom Session",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #2196F3; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Session Confirmed!</h2>
            <p>Hello <strong>${studentName}</strong>,</p>
            <p>Your peer-to-peer workspace tracking session has been successfully booked.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <p style="margin: 5px 0;"><strong>Mentor Assigned:</strong> ${mentorName}</p>
              <p style="margin: 5px 0;"><strong>Scheduled Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Scheduled Time:</strong> ${time || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>Session Focus:</strong> ${objective || "Mentorship Session"}</p>
            </div>
            <p style="font-size: 12px; color: #777;">Make sure your development environment updates are logged and ready to review ahead of schedule.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;">
            <p style="font-size: 11px; color: #aaa; text-align: center;">🌸 Powered by Code Blossom</p>
          </div>
        `
      };

      transporter.sendMail(mentorMailOptions, (mailErr) => {
        if (mailErr) console.error("⚠️ Nodemailer Mentor Dispatch Alert:", mailErr.message);
        else console.log("📧 Notification successfully sent to Mentor:", mentorEmail);
      });

      transporter.sendMail(studentMailOptions, (mailErr) => {
        if (mailErr) console.error("⚠️ Nodemailer Student Dispatch Alert:", mailErr.message);
        else console.log("📧 Confirmation successfully sent to Student:", studentEmail);
      });

      return res.status(200).json({ 
        success: true, 
        id: result.insertId 
      });
    });
  });
});

// DELETE A SPECIFIC BOOKING BY ID
app.delete("/bookings/:id", (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  const sql = "DELETE FROM bookings WHERE id = ?";

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("❌ FAILED TO DELETE BOOKING:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking record not found in system." });
    }

    console.log(`🗑️ Booking ID ${bookingId} deleted successfully.`);
    res.json({ success: true, message: "Session removed successfully! ✅" });
  });
});

// ADMIN: Fetch all unapproved mentors
app.get("/admin/pending-mentors", (req, res) => {
  const sql = "SELECT id, name, email FROM users WHERE role = 'mentor' AND is_approved = 0";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ADMIN: Approve a mentor
app.post("/admin/approve-mentor", (req, res) => {
  const { mentorId } = req.body;
  const sql = "UPDATE users SET is_approved = 1 WHERE id = ?";
  
  db.query(sql, [mentorId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Mentor approved successfully! 🎉" });
  });
});

// ✅ FIX 3: DYNAMIC ASSIGNMENT OF PRODUCTION PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});