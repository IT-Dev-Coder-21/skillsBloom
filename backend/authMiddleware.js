const jwt = require('jsonwebtoken');

// This tries to get the key from your .env file, or falls back to a long random string
const SECRET_KEY = process.env.JWT_SECRET || "a-very-long-random-string-that-is-hard-to-guess-12345";

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No token provided, access denied." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        // Save the user info for the next function to use
        req.user = decoded; 
        next();
    });
}

module.exports = { verifyToken, SECRET_KEY };