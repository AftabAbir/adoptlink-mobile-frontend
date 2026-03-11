// src/ViewAllUsers.js
import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import axios from "./axiosConfig";
import './ViewAllUsers.css';
import { useNavigate } from 'react-router-dom';

function ViewAllUsers() {
  const [users, setUsers] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!currentUser?.id) return;

    axios
      // .get(`http://localhost:8080/api/users/all?requesterId=${currentUser.id}`)
      .get(`/api/users/all?requesterId=${currentUser.id}`)
      .then((res) => setUsers(res.data))
      .catch(() => setError('Failed to fetch users. Only admins can view.'));

    // Fetch unread message indicators for each user
    axios
      // .get('http://localhost:8080/api/admin-messages/unread?receiverId=' + currentUser.id)
      .get('/api/admin-messages/unread?receiverId=' + currentUser.id)     
      .then((res) => {
        const map = {};
        res.data.forEach((msg) => {
          const senderId = msg.sender.id;
          map[senderId] = true;
        });
        setUnreadMap(map);
      })
      .catch((err) => console.error('Failed to fetch unread notifications', err));
  }, [currentUser]);

  const handleToggleStatus = async (userId, isActive) => {
    try {
      // const response = await axios.put(
      //   `http://localhost:8080/api/users/${userId}/status`,
      //   null,
      //   {
      //     params: {
      //       requesterId: currentUser.id,
      //       active: !isActive,
      //     },
      //   }
      // );
      const response = await axios.put(
        `/api/users/${userId}/status`,
        null,
        {
          params: {
            requesterId: currentUser.id,
            active: !isActive,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, active: !isActive } : u
        )
      );
      setMessage(response.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update user status.');
    }
  };

  const handleMessage = (userId, userName) => {
    navigate('/messages/user-chat', {
      state: {
        userId,
        userName,
        fromPage: '/admin/users',
      }
    });
  };

  return (
    <div className="view-users-container">
      <h2>👥 All Registered Users</h2>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.active ? '✅ Active' : '🚫 Deactivated'}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>

            {user.role !== 'admin' && (
              <>
                <button
                  className="status-button"
                  onClick={() => handleToggleStatus(user.id, user.active)}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  className="chat-button"
                  onClick={() => handleMessage(user.id, user.name)}
                >
                  💬 Message
                  {unreadMap[user.id] && <span className="notification-dot">🔴</span>}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewAllUsers;
