// src/Profile.js
import React, { useEffect, useState } from 'react';
import axios from "./axiosConfig";
import './Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [animals, setAnimals] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState("adoption");

  useEffect(() => {
    if (!user || !user.id) return;

    axios
      .get(`/api/animals/created-by/${user.id}`)
      .then((res) => {
        // 🔥 Normalize rescue fields
        const normalized = res.data.map(animal => ({
          ...animal,
          isRescueAccepted: animal.rescueAccepted,
          isRescued: animal.rescued
        }));

        setAnimals(normalized);
      })
      .catch(() => setMessage('Failed to load your posts.'));
  }, [user]);

  const handleDelete = async (animalId) => {
    try {
      await axios.delete(`/api/animals/${animalId}?userId=${user.id}`);
      setAnimals(prev => prev.filter(a => a.id !== animalId));
      setMessage('Post deleted successfully.');
    } catch {
      setMessage('Error deleting the post.');
    }
  };

  const handleMarkAsAdopted = async (animalId) => {
    try {
      await axios.put(`/api/animals/${animalId}/mark-adopted?userId=${user.id}`);
      setAnimals(prev =>
        prev.map(a =>
          a.id === animalId ? { ...a, adopted: true } : a
        )
      );
      setMessage('Animal marked as adopted.');
    } catch {
      setMessage('Failed to mark animal as adopted.');
    }
  };

  const filteredAnimals = animals.filter(a =>
    activeTab === "adoption"
      ? a.postType === "adoption"
      : a.postType === "rescue"
  );

  const renderRescueStatus = (animal) => {
    if (animal.isRescued) {
      return <span className="rescued-badge">✅ Rescued</span>;
    }

    if (animal.isRescueAccepted) {
      return <span className="rescue-progress-badge">🚑 Rescue in Progress</span>;
    }

    return <span className="rescue-pending-badge">🕒 Waiting for Admin</span>;
  };

  return (
    <div className="profile-container">
      <h2>👤📝 My Posts</h2>

      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Email:</strong> {user?.email}</p>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {/* Tabs */}
      <div className="post-type-tab-container">
        <button
          className={`tab-button ${activeTab === "adoption" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("adoption")}
        >
          🐾 Adoption Posts
        </button>

        <button
          className={`tab-button ${activeTab === "rescue" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("rescue")}
        >
          🚑 Rescue Posts
        </button>
      </div>

      {message && <p className="status-message">{message}</p>}

      <div className="animal-list">
        {filteredAnimals.length === 0 ? (
          <p>No {activeTab} posts yet.</p>
        ) : (
          filteredAnimals.map((animal) => (
            <div key={animal.id} className="animal-card">
              <img
                src={animal.imageUrl}
                alt={animal.name}
                className="animal-image"
                onError={(e) => e.target.style.display = "none"}
              />

              <h4>{animal.name}</h4>
              <p><strong>Type:</strong> {animal.type}</p>
              <p><strong>Location:</strong> {animal.location}</p>

              {/* ---------- ADOPTION POSTS ---------- */}
              {animal.postType === "adoption" && (
                <>
                  {animal.adopted ? (
                    <span className="adopted-badge">✅ Adopted</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDelete(animal.id)}
                        className="delete-button"
                      >
                        🗑 Delete
                      </button>

                      <button
                        onClick={() => handleMarkAsAdopted(animal.id)}
                        className="mark-button"
                      >
                        ✅ Mark as Adopted
                      </button>
                    </>
                  )}
                </>
              )}

              {/* ---------- RESCUE POSTS ---------- */}
              {animal.postType === "rescue" && (
                <>
                  {renderRescueStatus(animal)}

                  {/* ❌ DELETE DISABLED AFTER ACCEPT */}
                  {!animal.isRescueAccepted && !animal.isRescued && (
                    <button
                      onClick={() => handleDelete(animal.id)}
                      className="delete-button"
                    >
                      🗑 Delete
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
