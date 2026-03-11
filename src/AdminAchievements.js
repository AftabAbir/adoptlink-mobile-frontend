// src/AdminAchievements.js
import React, { useEffect, useState } from 'react';
import axios from "./axiosConfig";
import './AdminAchievements.css';
import { useNavigate } from 'react-router-dom';

function AdminAchievements() {
  const [adoptedAnimals, setAdoptedAnimals] = useState([]);
  const [rescuedAnimals, setRescuedAnimals] = useState([]);
  const [activeTab, setActiveTab] = useState("adopted");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      axios.get(`/api/animals/adopted?requesterId=${user.id}`),
      axios.get(`/api/animals/rescued?adminId=${user.id}`)
    ])
      .then(([adoptedRes, rescuedRes]) => {
        setAdoptedAnimals(adoptedRes.data || []);
        setRescuedAnimals(rescuedRes.data || []);
      })
      .catch(() => setMessage('Failed to load achievements. Admin only.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="achievements-container">
      <h2>🏆 Admin Achievements</h2>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {/* -------- TABS -------- */}
      <div className="post-type-tab-container">

        <button
          className={`tab-button ${activeTab === "adopted" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("adopted")}
        >
          🏠 Adopted Animals
          <span className="tab-badge">
            ({adoptedAnimals.length})
          </span>
        </button>

        <button
          className={`tab-button ${activeTab === "rescued" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("rescued")}
        >
          🚑 Rescued Animals
          <span className="tab-badge">
            ({rescuedAnimals.length})
          </span>
        </button>

      </div>

      {loading && <p>Loading...</p>}
      {message && <p className="error">{message}</p>}

      {/* -------- ADOPTED TAB -------- */}
      {activeTab === "adopted" && (
        <div className="adopted-list">
          {adoptedAnimals.length === 0 ? (
            <p>No animals have been adopted yet.</p>
          ) : (
            adoptedAnimals.map(animal => (
              <div key={animal.id} className="adopted-card">
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  onError={(e) => e.target.style.display = "none"}
                />
                <h4>{animal.name}</h4>
                <p><strong>Type:</strong> {animal.type}</p>
                <p><strong>Breed:</strong> {animal.breed}</p>
                <p><strong>Posted By:</strong> {animal.createdBy?.name}</p>
                <p><strong>Location:</strong> {animal.location}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* -------- RESCUED TAB -------- */}
      {activeTab === "rescued" && (
        <div className="adopted-list">
          {rescuedAnimals.length === 0 ? (
            <p>No rescues completed yet.</p>
          ) : (
            rescuedAnimals.map(animal => (
              <div key={animal.id} className="adopted-card">
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  onError={(e) => e.target.style.display = "none"}
                />
                <h4>{animal.name}</h4>
                <p><strong>Type:</strong> {animal.type}</p>
                <p><strong>Breed:</strong> {animal.breed}</p>
                <p><strong>Posted By:</strong> {animal.createdBy?.name}</p>
                <p><strong>Location:</strong> {animal.location}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminAchievements;
