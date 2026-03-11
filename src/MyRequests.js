// src/MyRequests.js
import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import axios from "./axiosConfig";
import './MyRequests.css';
import { useNavigate } from 'react-router-dom';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || !user.id) return;

    axios
      // .get(`http://localhost:8080/api/adoption-requests/user/${user.id}`)
      .get(`/api/adoption-requests/user/${user.id}`)
      .then((res) => setRequests(res.data))
      .catch(() => setMessage('Failed to load your adoption requests.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (animalId) => {
    try {
      // await axios.delete(`http://localhost:8080/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      await axios.delete(`/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      setRequests((prev) => prev.filter((req) => req.animal.id !== animalId));
      setMessage('Request cancelled.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to cancel request.');
    }
  };

  const handleChat = (ownerId, animalId, ownerName, animalName) => {
    navigate('/chat', {
      state: {
        receiverId: ownerId,
        animalId,
        receiverName: ownerName,
        animalName,
        fromPage: '/my-requests'
      }
    });
  };

  return (
    <div className="my-requests-container">
      <h2>📋 My Adoption Requests</h2>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {loading && <p>Loading...</p>}
      {message && <p className="message">{message}</p>}

      {requests.length === 0 ? (
        <p>You haven't sent any requests yet.</p>
      ) : (
        <div className="requests-list">
          {requests.map((req) => {
            const isAdopted = req.animal.adopted;
            return (
              <div key={req.id} className="request-card">
                <img src={req.animal.imageUrl} alt={req.animal.name} />
                <h3>{req.animal.name}</h3>
                <p><strong>Location:</strong> {req.animal.location}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>
                {isAdopted && <p className="adopted-label">✅ Adopted</p>}
                <a href={req.animal.mapLink} target="_blank" rel="noreferrer">📍 View Map</a>
                <br />

                {!isAdopted && req.status === 'pending' && (
                  <button className="cancel-button" onClick={() => handleCancel(req.animal.id)}>
                    ❌ Cancel Request
                  </button>
                )}

                {!isAdopted && req.status === 'approved' && (
                  <button
                    className="chat-button"
                    onClick={() =>
                      handleChat(
                        req.animal.createdBy.id,
                        req.animal.id,
                        req.animal.createdBy.name,
                        req.animal.name
                      )
                    }
                  >
                    💬 Chat with Owner
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyRequests;
