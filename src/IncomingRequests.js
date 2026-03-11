// src/IncomingRequests.js
import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import axios from "./axiosConfig";
import './IncomingRequests.css';
import { useNavigate } from 'react-router-dom';

function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) return;

    axios
      // .get(`http://localhost:8080/api/adoption-requests/owner/${storedUser.id}`)
      .get(`/api/adoption-requests/owner/${storedUser.id}`)
      .then((res) => setRequests(res.data))
      .catch(() => setMessage('Failed to load incoming adoption requests.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (requestId, newStatus) => {
    try {
      // await axios.put(`http://localhost:8080/api/adoption-requests/${requestId}/status?status=${newStatus}`);
      await axios.put(`/api/adoption-requests/${requestId}/status?status=${newStatus}`);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus } : r
        )
      );
      setMessage(`Request ${newStatus} successfully.`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update request.');
    }
  };

  return (
    <div className="incoming-requests-container">
      <h2>📨 Incoming Adoption Requests</h2>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {loading && <p>Loading...</p>}
      {message && <p className="message">{message}</p>}

      {requests.length === 0 ? (
        <p>No incoming requests yet.</p>
      ) : (
        <div className="request-list">
          {requests.map((req) => {
            const isAdopted = req.animal.adopted;

            return (
              <div key={req.id} className="request-card">
                <img src={req.animal.imageUrl} alt={req.animal.name} className="animal-image" />
                <h3>{req.animal.name}</h3>
                <p><strong>Requested by:</strong> {req.user.name}</p>
                <p><strong>Status:</strong> {req.status}</p>
                <p><strong>Location:</strong> {req.animal.location}</p>
                <a href={req.animal.mapLink} target="_blank" rel="noreferrer">📍 View Map</a>
                <br />
                {isAdopted && <p className="adopted-label">✅ Already Adopted</p>}

                <div className="actions">
                  {!isAdopted && req.status === 'pending' && (
                    <>
                      <button className="accept-button" onClick={() => handleAction(req.id, 'approved')}>✅ Accept</button>
                      <button className="reject-button" onClick={() => handleAction(req.id, 'rejected')}>❌ Reject</button>
                    </>
                  )}

                  {!isAdopted && req.status === 'approved' && (
                    <button
                      className="chat-button"
                      onClick={() => navigate('/chat', {
                        state: {
                          receiverId: req.user.id,
                          receiverName: req.user.name,
                          animalId: req.animal.id,
                          animalName: req.animal.name,
                          fromPage: '/incoming-requests'
                        }
                      })}
                    >
                      💬 Chat with {req.user.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IncomingRequests;
