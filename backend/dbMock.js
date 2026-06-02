const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  if (!fs.existsSync(dbPath)) {
    const defaultHash = bcrypt.hashSync("password123", 10);
    const initialData = {
      users: [
        {
          id: 1,
          name: "Jane Otaniel (Admin)",
          email: "otanieljane@gmail.com",
          password: defaultHash,
          role: "admin",
          is_approved: 1
        },
        {
          id: 2,
          name: "Alice Musukwa",
          email: "amusukwa@mubas.ac.mw",
          password: defaultHash,
          role: "mentor",
          is_approved: 1,
          title: "Fullstack Developer",
          bio: "Helping students build modern websites and applications with cutting-edge technologies.",
          image: "https://media.licdn.com/dms/image/v2/D4D03AQFLDhUysNv2Sw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1724589862035?e=1780531200&v=beta&t=KaFXonEAeWX8vQGHiwKtC4cmDUx8HdkY-yltuORl-Y8",
          skills: JSON.stringify(["React", "Node.js", "HTML", "SQL", "MongoDB"])
        },
        {
          id: 3,
          name: "Sana Abbas",
          email: "sabbas@mubas.ac.mw",
          password: defaultHash,
          role: "mentor",
          is_approved: 1,
          title: "Fullstack Developer",
          bio: "Guiding students in full-stack development.",
          image: "https://media.licdn.com/dms/image/v2/C4D03AQEbMg9L9KcgaQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1638369937627?e=1780531200&v=beta&t=CDDlotK-OstXO81vw6-IMqr062Ir4XXNVquuUuAfa7w",
          skills: JSON.stringify(["JavaScript", "Node.js", "Express", "MongoDB"])
        },
        {
          id: 4,
          name: "Caroline Mutemi",
          email: "cmutemi@mubas.ac.mw",
          password: defaultHash,
          role: "mentor",
          is_approved: 1,
          title: "Software Developer",
          bio: "Designing beautiful user experiences and building scalable web applications.",
          image: "https://media.licdn.com/dms/image/v2/D4E03AQEK-u9ItzSbiA/profile-displayphoto-crop_800_800/B4EZsqjqDtIwAI-/0/1765945552767?e=1780531200&v=beta&t=ff-Kgo8JRtKTayRdORKcd5VWM1oklT9P0ux8DzUIrPE",
          skills: JSON.stringify(["UI/UX", "React", "TypeScript", "CSS"])
        }
      ],
      bookings: [],
      mentor_availability: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function query(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }

  const data = readDb();
  const sqlClean = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  try {
    // 1. SELECT * FROM users WHERE email = ?
    if (sqlClean.includes('select * from users where email =')) {
      const email = params[0];
      const result = data.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
      return callback(null, result);
    }

    // 2. SELECT * FROM users
    if (sqlClean === 'select * from users') {
      return callback(null, data.users);
    }

    // 3. SELECT id, name, email FROM users WHERE role = 'mentor' AND is_approved = 0
    if (sqlClean.includes("where role = 'mentor' and is_approved = 0")) {
      const result = data.users
        .filter(u => u.role === 'mentor' && Number(u.is_approved) === 0)
        .map(u => ({ id: u.id, name: u.name, email: u.email }));
      return callback(null, result);
    }

    // 4. SELECT id, name, email, bio, skills, image, title FROM users WHERE role = 'mentor' AND is_approved = 1
    if (sqlClean.includes("where role = 'mentor' and is_approved = 1")) {
      const result = data.users
        .filter(u => u.role === 'mentor' && Number(u.is_approved) === 1)
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          bio: u.bio || '',
          skills: u.skills || '[]',
          image: u.image || '',
          title: u.title || ''
        }));
      return callback(null, result);
    }

    // 5. SELECT email FROM users WHERE name = ? AND role = 'mentor' LIMIT 1
    if (sqlClean.includes("select email from users where name =")) {
      const name = params[0];
      const result = data.users.filter(u => u.name === name && u.role === 'mentor');
      return callback(null, result);
    }

    // 6. INSERT INTO users (id, name, email, password, role, is_approved)
    if (sqlClean.includes('insert into users')) {
      const [id, name, email, password, role, is_approved] = params;
      const newUser = { id, name, email, password, role, is_approved, title: '', bio: '', image: '', skills: '[]' };
      data.users.push(newUser);
      writeDb(data);
      return callback(null, { insertId: id });
    }

    // 7. UPDATE users SET password = ? WHERE id = ?
    if (sqlClean.includes('update users set password =') && sqlClean.includes('where id =')) {
      const [password, id] = params;
      const user = data.users.find(u => Number(u.id) === Number(id));
      if (user) {
        user.password = password;
        writeDb(data);
      }
      return callback(null, { affectedRows: user ? 1 : 0 });
    }

    // 8. UPDATE users SET is_approved = 1 WHERE id = ?
    if (sqlClean.includes('update users set is_approved = 1 where id =')) {
      const [id] = params;
      const user = data.users.find(u => Number(u.id) === Number(id));
      if (user) {
        user.is_approved = 1;
        writeDb(data);
      }
      return callback(null, { affectedRows: user ? 1 : 0 });
    }

    // 9. UPDATE users SET title = ?, bio = ?, skills = ?, image = ? WHERE id = ?
    if (sqlClean.includes('update users set title =') || sqlClean.includes('update users set bio =')) {
      const [title, bio, skills, image, id] = params;
      const user = data.users.find(u => Number(u.id) === Number(id));
      if (user) {
        user.title = title;
        user.bio = bio;
        user.skills = skills;
        user.image = image;
        writeDb(data);
      }
      return callback(null, { affectedRows: user ? 1 : 0 });
    }

    // 10. SELECT * FROM bookings ORDER BY id DESC
    if (sqlClean.includes('select * from bookings')) {
      const sorted = [...data.bookings].sort((a, b) => b.id - a.id);
      return callback(null, sorted);
    }

    // 11. INSERT INTO bookings (id, studentName, studentEmail, mentorName, date, time, objective)
    if (sqlClean.includes('insert into bookings')) {
      const [id, studentName, studentEmail, mentorName, date, time, objective] = params;
      const newBooking = { id, studentName, studentEmail, mentorName, date, time, objective };
      data.bookings.push(newBooking);
      writeDb(data);
      return callback(null, { insertId: id });
    }

    // 12. DELETE FROM bookings WHERE id = ?
    if (sqlClean.includes('delete from bookings where id =')) {
      const id = params[0];
      const initialLen = data.bookings.length;
      data.bookings = data.bookings.filter(b => Number(b.id) !== Number(id));
      writeDb(data);
      return callback(null, { affectedRows: initialLen - data.bookings.length });
    }

    // 13. SELECT * FROM mentor_availability WHERE mentor_id = ?
    if (sqlClean.includes('select * from mentor_availability where mentor_id =')) {
      const mentorId = params[0];
      const result = data.mentor_availability.filter(a => Number(a.mentor_id) === Number(mentorId));
      return callback(null, result);
    }

    // 14. INSERT INTO mentor_availability (mentor_id, day_of_week, start_time, end_time)
    if (sqlClean.includes('insert into mentor_availability')) {
      const [mentor_id, day_of_week, start_time, end_time] = params;
      const id = Math.floor(Math.random() * 999999);
      const newAvail = { id, mentor_id, day_of_week, start_time, end_time };
      data.mentor_availability.push(newAvail);
      writeDb(data);
      return callback(null, { insertId: id });
    }

    // 15. DELETE FROM mentor_availability WHERE id = ?
    if (sqlClean.includes('delete from mentor_availability where id =')) {
      const id = params[0];
      const initialLen = data.mentor_availability.length;
      data.mentor_availability = data.mentor_availability.filter(a => Number(a.id) !== Number(id));
      writeDb(data);
      return callback(null, { affectedRows: initialLen - data.mentor_availability.length });
    }

    console.warn("Unmatched SQL query in dbMock:", sql);
    return callback(new Error("Unrecognized SQL query: " + sql));
  } catch (err) {
    console.error("dbMock Error:", err);
    return callback(err);
  }
}

module.exports = {
  query
};
