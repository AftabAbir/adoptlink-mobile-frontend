// src/AnimalsForAdoption.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import axios from "./axiosConfig"; // adjust path if needed
import './AnimalsForAdoption.css';

function AnimalsForAdoption() {
  const [animals, setAnimals] = useState([]);
  const [requestedAnimals, setRequestedAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch adoption posts
  useEffect(() => {
    const fetchAdoptionAnimals = async () => {
      try {
        // const response = await axios.get('http://localhost:8080/api/animals/post-type/adoption');
        const response = await axios.get('/api/animals/post-type/adoption');
        // 🔥 Filter out adopted animals
        const availableAnimals = response.data.filter((animal) => !animal.adopted);
        setAnimals(availableAnimals);
      } catch (err) {
        console.error(err);
        setError('Failed to load animals for adoption.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionAnimals();
  }, []);

  // Fetch requests made by this user
  useEffect(() => {
    if (!user || !user.id) return;

    axios
      // .get(`http://localhost:8080/api/adoption-requests/user/${user.id}`)
      .get(`/api/adoption-requests/user/${user.id}`)
      .then((res) => {
        const animalIds = res.data.map((req) => req.animal.id);
        setRequestedAnimals(animalIds);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Failed to fetch adoption requests.');
      });
  }, [user]);

  const handleRequest = async (animalId) => {
    try {
      // await axios.post(`http://localhost:8080/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      await axios.post(`/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      setRequestedAnimals((prev) => [...prev, animalId]);
      setMessage('Adoption request sent!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to send request.');
    }
  };

  const handleCancelRequest = async (animalId) => {
    try {
      // await axios.delete(`http://localhost:8080/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      await axios.delete(`/api/adoption-requests?userId=${user.id}&animalId=${animalId}`);
      setRequestedAnimals((prev) => prev.filter((id) => id !== animalId));
      setMessage('Adoption request cancelled.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to cancel request.');
    }
  };

  return (
    <div className="adoption-posts-container">
      <center>
        {/* <h1>AdoptLink</h1> */}
        <h1>🐶 Animals for Adoption</h1>
      </center>



      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {loading && <p>Loading adoption posts...</p>}
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <div className="adoption-posts-list">
        {animals.map((animal) => {
          const isRequested = requestedAnimals.includes(animal.id);
          const isOwnPost = animal.createdBy?.id === user?.id;

          return (
            <div key={animal.id} className="adoption-card">
              <img src={animal.imageUrl} alt={animal.name} className="animal-image" />
              <h3>{animal.name}</h3>
              <p><strong>Type:</strong> {animal.type}</p>
              <p><strong>Breed:</strong> {animal.breed}</p>
              <p><strong>Description:</strong> {animal.description}</p>
              <p><strong>Location:</strong> {animal.location}</p>
              <a href={animal.mapLink} target="_blank" rel="noopener noreferrer">📍 View on Map</a>
              <br />

              {isOwnPost ? (
                <button className="request-button" disabled>🔒 Your Post</button>
              ) : isRequested ? (
                <button className="cancel-button" onClick={() => handleCancelRequest(animal.id)}>
                  ❌ Cancel Request
                </button>
              ) : (
                <button onClick={() => handleRequest(animal.id)} className="request-button">
                  Request Adoption
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnimalsForAdoption;
