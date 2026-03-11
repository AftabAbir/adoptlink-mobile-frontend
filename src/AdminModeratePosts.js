// src/AdminModeratePosts.js
import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import axios from "./axiosConfig"; // adjust path if needed
import { useNavigate } from 'react-router-dom';
import './AdminModeratePosts.css'; // Optional CSS if needed

function AdminModeratePosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!currentUser?.id) return;

    axios
      // .get('http://localhost:8080/api/animals')
      .get('/api/animals')
      .then((res) => setPosts(res.data))
      .catch(() => setError('Failed to load animal posts.'));
  }, [currentUser]);

  const handleDelete = async (animalId) => {
    try {
      // await axios.delete(`http://localhost:8080/api/animals/admin/${animalId}?adminId=${currentUser.id}`);
      await axios.delete(`/api/animals/admin/${animalId}?adminId=${currentUser.id}`);
      setPosts((prev) => prev.filter((a) => a.id !== animalId));
      setMessage(`Post with ID ${animalId} deleted.`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete the post.');
    }
  };

  return (
    <div className="admin-moderate-posts-container">
      <h2>🛠 Moderate Animal Posts</h2>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <div className="post-list">
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          posts.map((animal) => (
            <div key={animal.id} className="post-card">
              <img src={animal.imageUrl} alt={animal.name} className="animal-image" />
              <h3>{animal.name}</h3>
              <p><strong>Type:</strong> {animal.type}</p>
              <p><strong>Post Type:</strong> {animal.postType}</p>
              <p><strong>Location:</strong> {animal.location}</p>
              <p><strong>Posted By:</strong> {animal.createdBy?.name || 'Unknown'}</p>
              <button
                className="delete-button"
                onClick={() => handleDelete(animal.id)}
              >
                🗑 Delete Post
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminModeratePosts;
