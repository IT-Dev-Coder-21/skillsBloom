console.log("SERVER FILE IS RUNNING");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "JANE2005",
  database: "skillsbloom"
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// TEST
app.get("/test", (req, res) => {
  res.send("Test works");
});

// USERS
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// SESSIONS
app.get("/sessions", (req, res) => {
  db.query("SELECT * FROM sessions", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// QUESTIONS
app.get("/questions", (req, res) => {
  db.query("SELECT * FROM questions", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// ATTENDANCE
app.get("/attendance", (req, res) => {
  db.query("SELECT * FROM session_attendance", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});
// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Registration failed" });
    }

    res.json({
      success: true,
      message: "User registered successfully",
      user: { name, email, role }
    });
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
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
// BOOK SESSION
app.post("bookings", (req, res) => {
  const { studentName, studentEmail, mentorName, date, time, objective } = req.body;

  const sql = `
    INSERT INTO bookings (studentName, studentEmail, mentorName, date, time, objective)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [studentName, studentEmail, mentorName, date, time, objective], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});
// GET BOOKINGS
app.get("/bookings", (req, res) => {
  const sql = "SELECT * FROM bookings ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});