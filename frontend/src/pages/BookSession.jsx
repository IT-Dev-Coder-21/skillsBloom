import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function BookSession() {
  const navigate = useNavigate();
  const { mentor } = useParams();

  const [form, setForm] = useState({
    date: "",
    time: "",
    objective: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    // ✅ safety check
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!form.date || !form.time || !form.objective) {
      alert("Please fill all fields");
      return;
    }

    const bookingData = {
      studentName: user.name,
      studentEmail: user.email,
      mentorName: mentor || "Unknown Mentor",
      date: form.date,
      time: form.time,
      objective: form.objective
    };

    try {
      const res = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();

      if (data.success) {
        alert("Booking successful 🎉");
        navigate("/student-dashboard");
      } else {
        alert("Booking failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-card">
        <h2>Book Session with {mentor}</h2>

        <input
          type="date"
          name="date"
          onChange={handleChange}
        />

        <input
          type="time"
          name="time"
          onChange={handleChange}
        />

        <textarea
          name="objective"
          placeholder="Your goal for this session..."
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}