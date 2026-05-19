// src/config.js

// This automatically detects if you are developing on your laptop or if the site is live on the internet
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://skills-bloom-api.onrender.com"; // We will update this specific link later

export default API_BASE_URL;