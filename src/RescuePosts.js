// src/RescuePosts.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "./axiosConfig";
import './RescuePosts.css';

function RescuePosts() {
  const [animals, setAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchRescueAnimals();
  }, []);

  const fetchRescueAnimals = async () => {
    try {
      const response = await axios.get('/api/animals/post-type/rescue');

      const activeRescues = response.data
        .filter(a => !a.rescued)
        .map(animal => ({
          ...animal,
          isRescueAccepted: animal.rescueAccepted,
          isRescued: animal.rescued
        }));

      setAnimals(activeRescues);
    } catch (err) {
      console.error(err);
      setError('Failed to load rescue posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRescue = async (animalId) => {
    try {
      await axios.put(`/api/animals/rescue/${animalId}/accept`, null, {
        params: { adminId: user.id }
      });

      setAnimals(prev =>
        prev.map(animal =>
          animal.id === animalId
            ? { ...animal, isRescueAccepted: true }
            : animal
        )
      );
    } catch {
      alert("Failed to accept rescue.");
    }
  };

  const handleMarkRescued = async (animalId) => {
    try {
      await axios.put(`/api/animals/rescue/${animalId}/mark-rescued`, null, {
        params: { adminId: user.id }
      });

      setAnimals(prev => prev.filter(a => a.id !== animalId));
    } catch {
      alert("Failed to mark as rescued.");
    }
  };

  // 🕒 DATE & TIME FORMAT
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // 🔥 TAB FILTERS
  const pendingRescues = animals.filter(a => !a.isRescueAccepted);
  const acceptedRescues = animals.filter(a => a.isRescueAccepted);

  const displayedAnimals =
    activeTab === "pending" ? pendingRescues : acceptedRescues;

  return (
    <div className="rescue-posts-container">
      <center><h2>🐾 Rescue Posts</h2></center>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {/* 🔥 TABS */}
      <div className="rescue-tabs">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Rescue ({pendingRescues.length})
        </button>

        <button
          className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Rescue ({acceptedRescues.length})
        </button>
      </div>

      {loading && <p>Loading rescue posts...</p>}
      {error && <p className="error">{error}</p>}

      <div className="rescue-posts-list">
        {displayedAnimals.map(animal => (
          <div key={animal.id} className="rescue-card">
            <img
              src={animal.imageUrl}
              alt={animal.name}
              className="animal-image"
              onError={(e) => e.target.style.display = "none"}
            />

            <h3>{animal.name}</h3>

            <p className="post-time">
              🕒 Posted on: {formatDateTime(animal.createdAt)}
            </p>

            <p><strong>Type:</strong> {animal.type}</p>
            <p><strong>Breed:</strong> {animal.breed}</p>
            <p><strong>Description:</strong> {animal.description}</p>
            <p><strong>Location:</strong> {animal.location}</p>

            <a href={animal.mapLink} target="_blank" rel="noopener noreferrer">
              📍 View on Map
            </a>

            {isAdmin && !animal.isRescueAccepted && (
              <button
                className="accept-btn"
                onClick={() => handleAcceptRescue(animal.id)}
              >
                ✅ Accept Rescue
              </button>
            )}

            {isAdmin && animal.isRescueAccepted && (
              <button
                className="rescued-btn"
                onClick={() => handleMarkRescued(animal.id)}
              >
                🏁 Mark as Rescued
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RescuePosts;
