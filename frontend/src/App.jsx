import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Mentors from "./pages/Mentors";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import BookSession from "./pages/BookSession";
import AdminDashboard from "./pages/AdminDashboard"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Informational Branding Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/login" element={<Login />} />
        
        {/* Workspace Hub Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        
        {/* ✅ FIXED PARAMETER: Swapped :mentor out for :mentorName to sync up directly with useParams() inside BookSession.jsx */}
        <Route path="/book/:mentorName" element={<BookSession />} />
        
        {/* Central Administration Hub */}
        <Route path="/admin-control" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;