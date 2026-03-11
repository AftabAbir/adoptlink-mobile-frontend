import React, { useState, useEffect } from 'react';
import axios from "./axiosConfig";
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AdoptLink | Login";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/users/login', formData);

      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage(`Welcome, ${res.data.name}!`);

      navigate('/dashboard');
    } catch (err) {
      setMessage('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="login-container">
      <header>
        <h1>AdoptLink</h1>
      </header>

      <h2>🔐 Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🚫" : "👁️"}
          </span>
        </div>

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}

      <p>Don’t have an account?</p>
      <button onClick={() => navigate('/')}>Go to Register</button>
    </div>
  );
}

export default Login;
