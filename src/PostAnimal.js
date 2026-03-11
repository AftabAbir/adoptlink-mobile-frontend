// src/PostAnimal.js
import React, { useState } from 'react';
import axios from "./axiosConfig";
import { useNavigate } from 'react-router-dom';
import './PostAnimal.css';

function PostAnimal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    description: '',
    location: '',
    postType: 'rescue',
    imageUrl: '',
    mapLink: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let imageUrl = formData.imageUrl;

      // Step 1: Upload image if selected
      if (selectedFile) {
        setUploading(true);
        const imgData = new FormData();
        imgData.append('file', selectedFile);

        // Example: http://<your-ipv4>:8080/api/animals/upload
        // const uploadRes = await axios.post('/api/animals/upload', imgData, {
        //   headers: { 'Content-Type': 'multipart/form-data' }
        // });
        const uploadRes = await axios.post('/api/uploads', imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageUrl = uploadRes.data; // assuming backend returns the image URL
        setUploading(false);
      }

      // Step 2: Post the animal data
      await axios.post(`/api/animals?userId=${user.id}`, {
        ...formData,
        imageUrl
      });

      setMessage('✅ Animal posted successfully!');
      setFormData({
        name: '',
        type: '',
        breed: '',
        description: '',
        location: '',
        postType: 'rescue',
        imageUrl: '',
        mapLink: ''
      });
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to post the animal.');
      setUploading(false);
    }
  };

  return (
    <div className="post-animal-container">
      <h2>📤 Post a New Animal</h2>

      <form onSubmit={handleSubmit} className="post-form">
        <input type="text" name="name" placeholder="Animal Name" value={formData.name} onChange={handleChange} required /> <br /><br/>
        <input type="text" name="type" placeholder="Type (Dog, Cat, etc.)" value={formData.type} onChange={handleChange} required /><br /><br/>
        <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} /> <br /><br/>
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required /> <br /><br/>
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required /> <br /><br/>
        {/* <input type="text" name="mapLink" placeholder="Google Map Link" value={formData.mapLink} onChange={handleChange} /> <br /><br/> */}
        <input type="text" name="mapLink" placeholder="Google Map Link" value={formData.mapLink} onChange={handleChange} /> <br /><br/>

        <select name="postType" value={formData.postType} onChange={handleChange}>
          <option value="rescue">Rescue</option>
          <option value="adoption">Adoption</option>
        </select>
        <br /><br/>

        {/* File Upload Section */}
        <input type="file" accept="image/*" onChange={handleFileChange} /> <br /><br/>
        {selectedFile && <p>📁 Selected: {selectedFile.name}</p>}

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>

      <p className="message">{message}</p>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default PostAnimal;
