// REPLACE everything in authMiddleware.js with this:
function verifyToken(req, res, next) {
    // We are forcing the middleware to always proceed
    console.log("DEBUG: Authentication bypassed for presentation.");
    next(); 
}

module.exports = { verifyToken };