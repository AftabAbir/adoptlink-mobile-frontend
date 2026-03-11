import React, { useState, useEffect } from 'react';
import axios from "./axiosConfig";
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AdoptLink | Register";
  }, []);

  // Password validation regex
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8 || password.length > 20) {
      errors.push("Password must be 8–20 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Must include at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Must include at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Must include at least one number");
    }
    if (!/[@#$%^&*!_\-]/.test(password)) {
      errors.push("Must include at least one special character (@, #, $, %, ^, &, *, !, _, -)");
    }

    setPasswordErrors(errors);
    setPasswordValid(errors.length === 0);
  };

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);

    if (e.target.name === "password") {
      validatePassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      setMessage("Please fix your password errors before registering.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post('/api/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log(res.data);
      setMessage("Registered successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Registration failed.");
    }
  };

  return (
    <div className="register-container">
      <header>
        <h1>AdoptLink</h1>
      </header>

      <h2>📝 Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
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

        {/* Password validation error list */}
        <ul className="password-errors">
          {passwordErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={!passwordValid}>
          Register
        </button>
      </form>

      <p className="message">{message}</p>

      <p>Already have an account?</p>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
}

export default Register;
