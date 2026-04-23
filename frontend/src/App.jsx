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



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />   {/* NEW */}
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/book-session/:mentor" element={<BookSession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;