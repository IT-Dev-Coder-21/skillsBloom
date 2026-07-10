import API_BASE_URL from "./config";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BookSession() {
  const { mentorName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // MENTOR DETAILS & AVAILABILITY STATE
  const [mentorDetails, setMentorDetails] = useState(null);
  const [availability, setAvailability] = useState([]); // ✅ FIXED: Initialized as empty array
  const [matchingSlots, setMatchingSlots] = useState([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");

  // ✅ STATUS BANNER STATE
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    date: "",
    time: "",
    objective: ""
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token"); // ✅ FIXED: Retrieve token for headers
    if (!u) {
      navigate("/login");
      return;
    }
    setUser(u);

    // Fetch mentor details by name
    fetch(`${API_BASE_URL}/api/mentors`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const matched = data.find(m => m.name.toLowerCase() === mentorName.toLowerCase());
        if (matched) {
          setMentorDetails(matched);
          
          // ✅ FIXED: Use matched.email instead of undefined mentorEmail
          fetch(`${API_BASE_URL}/mentor/slots/${matched.email}`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          .then((res) => res.json())
          .then((availData) => {
             setAvailability(Array.isArray(availData) ? availData : []);
          })
          .catch((err) => console.error("Error fetching availability:", err));
        }
      })
      .catch((err) => console.error("Error fetching mentors:", err));
  }, [mentorName, navigate]);

  // Determine availability slots whenever chosen date changes
  useEffect(() => {
    if (!form.date || !Array.isArray(availability)) {
      setMatchingSlots([]);
      setSelectedDayOfWeek("");
      return;
    }
    const date = new Date(form.date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    setSelectedDayOfWeek(dayName);

    // ✅ FIXED: Safe filter check
    const slots = availability.filter(a => a.day_of_week && a.day_of_week.toLowerCase() === dayName.toLowerCase());
    setMatchingSlots(slots);
  }, [form.date, availability]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // ✅ FIXED: Get token

    if (!form.date || !form.time || !form.objective) {
      setStatusMessage({ text: "Please fill in all fields before booking! ⚠️", type: "error" });
      return;
    }

    const date = new Date(form.date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];

    const slots = availability.filter(a => a.day_of_week && a.day_of_week.toLowerCase() === dayName.toLowerCase());
    /*
    if (availability.length > 0) {
      if (slots.length === 0) {
        setStatusMessage({ text: `The mentor is not available on ${dayName}s! ⚠️`, type: "error" });
        return;
      }
      
      const cleanTime = form.time.substring(0, 5);
      const isWithinAnySlot = slots.some(s => {
        const cleanStart = s.start_time.substring(0, 5);
        const cleanEnd = s.end_time.substring(0, 5);
        return cleanTime >= cleanStart && cleanTime <= cleanEnd;
      });

      if (!isWithinAnySlot) {
        const slotRanges = slots.map(s => `${s.start_time.substring(0,5)} - ${s.end_time.substring(0,5)}`).join(", ");
        setStatusMessage({ text: `Selected time is outside the mentor's available slots on ${dayName}s (${slotRanges})! ⚠️`, type: "error" });
        return;
      }
    }*/

    const newBooking = {
      mentorName: mentorName,
      studentName: user.name,
      studentEmail: user.email,
      date: form.date,
      time: form.time,
      objective: form.objective
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ FIXED: Header
        },
        body: JSON.stringify(newBooking)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({ 
          text: errorData.errorDetails || `Server error (${res.status}). Check your backend console! 🖥️`, 
          type: "error" 
        });
        return;
      }

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ text: "Session booked successfully! Redirecting... 🎉", type: "success" });
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 2000);
      } else {
        setStatusMessage({ text: data.message || "Failed to book session. Please try again.", type: "error" });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setStatusMessage({ text: "Server error — is the backend database running? 🖥️", type: "error" });
    }
  };

  if (!user) return <div className="loading" style={{ padding: "40px", textAlign: "center" }}><h2>Loading Context Parameters...</h2></div>;

  return (
    <div className="booking-page-container" style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <div className="auth-container" style={{ padding: "30px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "left" }}>
        
        <h2 style={{ marginBottom: "10px", color: "#333" }}>📅 Book a Session</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>Scheduling a sync with <strong>{mentorName}</strong></p>

        {mentorDetails && (
          <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "6px", marginBottom: "20px", borderLeft: "4px solid #4CAF50" }}>
            <h4 style={{ margin: 0, color: "#333" }}>{mentorDetails.name}</h4>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#4CAF50" }}>{mentorDetails.role}</span>
            <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#555" }}>{mentorDetails.bio}</p>
          </div>
        )}

        {statusMessage.text && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: "500",
            backgroundColor: statusMessage.type === "success" ? "#e8f5e9" : "#ffebee",
            color: statusMessage.type === "success" ? "#2e7d32" : "#c62828",
            border: statusMessage.type === "success" ? "1px solid #a5d6a7" : "1px solid #ef9a9a",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label htmlFor="date" style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Date</label>
            <input 
              id="date"
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          {form.date && (
            <div style={{ background: "#eef2f7", padding: "12px", borderRadius: "6px", fontSize: "13px", color: "#333" }}>
              <strong>🗓️ Selected day: {selectedDayOfWeek}</strong>
              <div style={{ marginTop: "5px" }}>
                {matchingSlots.length > 0 ? (
                  <div>
                    <span style={{ color: "#2e7d32", fontWeight: "bold" }}>Available Slots:</span>
                    <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                      {matchingSlots.map(s => (
                        <li key={s.id}>⏰ {s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    {availability.length > 0 ? (
                      <span style={{ color: "#c62828", fontWeight: "bold" }}>The mentor has no available slots scheduled on this day.</span>
                    ) : (
                      <span style={{ color: "#777" }}>Defaulting to general hours (Mon-Fri 09:00 AM - 05:00 PM).</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="time" style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Select Time</label>
            <input 
              id="time"
              type="time" 
              name="time" 
              value={form.time} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label htmlFor="objective" style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Learning Objective / Topic</label>
            <textarea 
              id="objective"
              name="objective" 
              placeholder="e.g., Troubleshooting React state rendering problems..." 
              value={form.objective} 
              onChange={handleChange} 
              rows="4"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontFamily: "inherit", resize: "none" }}
            />
          </div>

          <button type="submit" className="login-btn" style={{ width: "100%", padding: "12px", marginTop: "10px", fontWeight: "bold" }}>
            Confirm Appointment
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate("/student-dashboard")}
            style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#666", fontWeight: "500" }}
          >
            Cancel and Go Back
          </button>
        </form>
      </div>
    </div>
  );
}