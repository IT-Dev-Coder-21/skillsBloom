require('dotenv').config();

console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

// IMPORT MIDDLEWARE
const { verifyToken } = require('./authMiddleware');

const app = express();

app.use(cors({ 
    origin: ["http://localhost:5173", "https://skills-bloom.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true 
}));

app.use(express.json());

// ---------------------------------------------------------
// DATABASE CONNECTION
// ---------------------------------------------------------
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
    });
  }
});

// ---------------------------------------------------------
// CLOUD-FRIENDLY EMAIL FUNCTION
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------

app.get("/api/mentors", (req, res, next) => {
  db.query("SELECT id, name, email, role, image, bio, title, skills FROM users WHERE role = 'mentor'", (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});
app.post("/register", (req, res, next) => { 
  const { name, email, password, role, image_url } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ success: false, message: "Password too short." });
  
  const normalizedRole = role ? role.toLowerCase() : "student";
  const isApproved = normalizedRole === 'mentor' ? 0 : 1; 
  
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) return next(hashErr);
    
    db.query("INSERT INTO users (name, email, password, role, is_approved, image) VALUES (?, ?, ?, ?, ?, ?)", 
    [name, email, hashedPassword, normalizedRole, isApproved, image_url || null], (err) => {
      if (err) return next(err);
      
      // THE FIX: Wrap emails in try...catch so a failed email doesn't break registration!
      try {
          sendEmailViaHTTP({
            to: email,
            subject: "Welcome to Skills Bloom!",
            textContent: `Hi ${name}, your account has been created successfully.`
          });

          sendEmailViaHTTP({
            to: process.env.EMAIL_USER,
            subject: "New User Registration",
            textContent: `New user: ${name} (${email})`
          });
      } catch (emailErr) {
          console.error("Email failed, but user was saved:", emailErr);
      }

      res.json({ success: true, message: "Account created successfully!" });
    });
  });
});
app.post("/login", (req, res, next) => {
  // Use .trim() to ensure no accidental spaces are causing issues
  const email = req.body.email.trim(); 
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return next(err);
    if (result.length === 0) {
        console.log("Login Failed: Email not found in DB.");
        return res.json({ success: false, message: "Invalid credentials." });
    }

    const user = result[0];
    
    // --- DIAGNOSTIC LOGS ---
    console.log("--- LOGIN ATTEMPT ---");
    console.log("Email:", user.email);
    console.log("Hash from DB:", user.password);
    console.log("Length of Hash:", user.password.length); // If this is less than 60, your DB chopped it!
    // -----------------------

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        console.log("Login Failed: Passwords do not match.");
        return res.json({ success: false, message: "Invalid credentials." });
    }

    if (user.role === 'mentor' && user.is_approved === 0) {
      return res.json({ success: false, message: "Account pending approval." });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "your_super_secret_key", { expiresIn: '24h' });
    
    res.json({ 
        success: true, 
        message: "Login Successful!", 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image, is_approved: user.is_approved } 
    });
  });
});
// PROTECTED ROUTES
app.get("/admin/pending-mentors", verifyToken, (req, res, next) => {
  db.query("SELECT id, name, email FROM users WHERE role = 'mentor' AND is_approved = 0", (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

app.post("/admin/approve-mentor", verifyToken, (req, res, next) => {
  db.query("UPDATE users SET is_approved = 1 WHERE id = ?", [req.body.mentorId], (err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

app.get("/bookings", verifyToken, (req, res, next) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) return next(err);
    res.send(result);
  });
});

app.post("/bookings", verifyToken, (req, res, next) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;
  
  // 1. Save to Database
  db.query("INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective) VALUES (?, ?, ?, ?, ?, ?)", 
  [studentName, studentEmail, mentorName, date, time, objective], (err) => {
    if (err) return next(err);

    // 2. Fetch Mentor's Email (Assuming you want to find the mentor's email by name)
    db.query("SELECT email FROM users WHERE name = ?", [mentorName], (err, results) => {
      if (err || results.length === 0) {
        console.error("Could not find mentor email for notification");
      } else {
        const mentorEmail = results[0].email;

        // 3. Email to Student
        sendEmailViaHTTP({
          to: studentEmail,
          subject: "Session Confirmed!",
          textContent: `Hi ${studentName}, your session with ${mentorName} is confirmed for ${date} at ${time}. Objective: ${objective}`
        });

        // 4. Email to Mentor
        sendEmailViaHTTP({
          to: mentorEmail,
          subject: "New Student Booking",
          textContent: `Hello! ${studentName} has booked a session with you on ${date} at ${time}. Objective: ${objective}`
        });
      }
    });

    res.json({ success: true });
  });
});

app.post("/mentor/add-slot", verifyToken, (req, res, next) => {
  db.query("INSERT INTO mentor_availability (mentor_email, available_date, available_time) VALUES (?, ?, ?)", 
  [req.body.email, req.body.date, req.body.time], (err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

app.delete("/mentor/slots/:id", verifyToken, (req, res, next) => {
  db.query("DELETE FROM mentor_availability WHERE id = ?", [req.params.id], (err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});
app.get("/mentor/slots/:email", verifyToken, (req, res, next) => {
  const mentorEmail = req.params.email;
  db.query("SELECT * FROM mentor_availability WHERE mentor_email = ?", [mentorEmail], (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});
app.delete("/bookings/:id", verifyToken, (req, res, next) => {
  db.query("DELETE FROM bookings WHERE id = ?", [req.params.id], (err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

// CENTRAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("LOGGED ERROR:", err.stack);
  res.status(500).json({ success: false, message: "A server error occurred. Please try again later." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));