// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!user) {
    // Store the location user tried to access
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: "Please login to continue"} }
      />
    );
  }

  return children;
};

export default ProtectedRoute;
