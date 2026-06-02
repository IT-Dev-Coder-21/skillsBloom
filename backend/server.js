require('dotenv').config();

console.log("SERVER FILE IS RUNNING IN PRODUCTION MODE");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
// Nodemailer removed to prevent connection errors

const app = express();

// Single, clean CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

const bcrypt = require("bcryptjs");

// DATABASE CONNECTION
const db = !process.env.DB_HOST
  ? require("./dbMock")
  : mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });

if (process.env.DB_HOST) {
  db.connect((err) => {
    if (err) {
      console.log("MySQL Connection Error ❌:", err);
    } else {
      console.log("MySQL Connected Successfully ✅");
      initializeRealDatabaseSchema();
    }
  });
} else {
  console.log("MySQL Database Mock Connected Successfully ✅");
}

function addColumnIfNotExists(columnName, columnType) {
  db.query(`ALTER TABLE users ADD COLUMN ${columnName} ${columnType}`, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes("Duplicate column name")) {
        // Already exists, ignore
      } else {
        console.warn(`Could not add column ${columnName}:`, err.message);
      }
    }
  });
}

function initializeRealDatabaseSchema() {
  addColumnIfNotExists("bio", "TEXT");
  addColumnIfNotExists("skills", "TEXT");
  addColumnIfNotExists("image", "TEXT");
  addColumnIfNotExists("title", "VARCHAR(255)");

  const createAvailTable = `
    CREATE TABLE IF NOT EXISTS mentor_availability (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mentor_id INT NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  db.query(createAvailTable, (err) => {
    if (err) console.error("Schema Migration Error on creating mentor_availability:", err);
  });
}

// 🚀 CLOUD-FRIENDLY HTTP EMAIL FUNCTION (Replaces Nodemailer SMTP)
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

// GET APPROVED MENTORS FOR DYNAMIC DISPLAY
app.get("/mentors", (req, res) => {
  db.query("SELECT id, name, email, bio, skills, image, title FROM users WHERE role = 'mentor' AND is_approved = 1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE MENTOR PROFILE DETAILS
app.put("/mentors/profile", (req, res) => {
  const { title, bio, skills, image, id } = req.body;
  const skillsStr = Array.isArray(skills) ? JSON.stringify(skills) : skills;
  const sql = "UPDATE users SET title = ?, bio = ?, skills = ?, image = ? WHERE id = ?";
  db.query(sql, [title, bio, skillsStr, image, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Profile updated successfully! ✅" });
  });
});

// GET WEEKLY AVAILABILITY FOR A MENTOR
app.get("/mentors/:id/availability", (req, res) => {
  db.query("SELECT * FROM mentor_availability WHERE mentor_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ADD WEEKLY AVAILABILITY FOR A MENTOR
app.post("/mentors/availability", (req, res) => {
  const { mentorId, dayOfWeek, startTime, endTime } = req.body;
  const sql = "INSERT INTO mentor_availability (mentor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)";
  db.query(sql, [mentorId, dayOfWeek, startTime, endTime], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Availability added!" });
  });
});

// DELETE WEEKLY AVAILABILITY SLOT
app.delete("/mentors/availability/:id", (req, res) => {
  db.query("DELETE FROM mentor_availability WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Availability removed successfully! ✅" });
  });
});

// REGISTRATION WITH EMAIL NOTIFICATIONS & PASSWORD SHIELD (HASHED WITH BCRYPT)
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

  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) return res.status(500).json({ success: false, message: "Server hashing error." });

    const sql = "INSERT INTO users (id, name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [randomId, name, email, hashedPassword, normalizedRole, isApproved], (err, result) => {
      if (err) return res.status(500).json({ success: false, errorDetails: err.sqlMessage || err.message });

      // 📩 1. ALERT EMAIL TO YOU (The Admin)
      sendEmailViaHTTP({
        to: "otanieljane@gmail.com",
        subject: "🚨 New User Registration Alert - Skills Bloom",
        textContent: `Hello Admin,\n\nA new user has registered on Skills Bloom!\n\nDetails:\n- Name: ${name}\n- Email: ${email}\n- Role: ${normalizedRole}\n- Account Status: ${isApproved === 1 ? 'Automatically Approved' : 'Pending Admin Approval'}\n\n Thank You!,`
      });

      // 📩 2. WELCOME/WAIT EMAIL TO THE REGISTERED USER
      sendEmailViaHTTP({
        to: email,
        subject: "Welcome to Skills Bloom! 🌱 Account Received",
        textContent: `Hello ${name},\n\nThank you for registering an account with Skills Bloom as a ${normalizedRole}!\n\nYour details have been successfully received. Please wait for your official confirmation email from our team before attempting to log in.\n\nWe look forward to blooming with you!\n\nBest regards,\nSkills Bloom Team 🌸`
      });

      // Send successful response with your custom message back to React
      res.json({ 
        success: true, 
        message: "Account created successfully! Please check your inbox and wait for your confirmation email. 📥" 
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });
    if (result.length > 0) {
      const storedPassword = result[0].password;
      let isMatch = false;

      // Check if storedPassword looks like a bcrypt hash (starts with $2a$ or $2b$)
      if (storedPassword && (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$"))) {
        isMatch = await bcrypt.compare(password, storedPassword);
      } else {
        // Plaintext fallback
        isMatch = (password === storedPassword);
        if (isMatch) {
          // Auto-migrate to bcrypt hash in the background
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, result[0].id]);
          } catch (migrateErr) {
            console.error("Failed to migrate password hash in background:", migrateErr);
          }
        }
      }

      if (isMatch) {
        res.json({ success: true, message: "Login successful", user: result[0] });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
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

      // 📩 3. STUDENT BOOKING CONFIRMATION
      sendEmailViaHTTP({
        to: studentEmail, 
        subject: "Your Mentorship Session is Confirmed! 🎉",
        textContent: `Hello ${studentName},\n\nYour session with ${mentorName} is confirmed for ${date} at ${time}.\nObjective: ${objective}\n\nBest regards,\nSkills Bloom Team`
      });

      // 📩 4. MENTOR BOOKING ALERT
      if (mentorEmail) {
        sendEmailViaHTTP({
          to: mentorEmail,
          subject: "New Mentorship Booking Notification! 📅",
          textContent: `Hello ${mentorName},\n\nA student has booked a session with you!\n\nDetails:\n- Student Name: ${studentName}\n- Date: ${date}\n- Time: ${time}\n- Objective: ${objective}\n\nPlease prepare accordingly.\n\nBest regards,\nSkills Bloom Team`
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