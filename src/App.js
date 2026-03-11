// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import RescuePosts from './RescuePosts';
import AnimalsForAdoption from './AnimalsForAdoption';
import Profile from './Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PostAnimal from './PostAnimal';
import MyRequests from './MyRequests';
import IncomingRequests from './IncomingRequests';
import ChatPage from './ChatPage';
import ViewAllUsers from './ViewAllUsers';
import AdminAchievements from './AdminAchievements';
import AdminModeratePosts from './AdminModeratePosts'; //  New
import UserMessagePage from './UserMessagePage'; //  Add this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rescue-posts"
          element={
            <ProtectedRoute>
              <RescuePosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adoption-posts"
          element={
            <ProtectedRoute>
              <AnimalsForAdoption />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-animal"
          element={
            <ProtectedRoute>
              <PostAnimal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incoming-requests"
          element={
            <ProtectedRoute>
              <IncomingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <ViewAllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute>
              <AdminAchievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderate-posts"
          element={
            <ProtectedRoute>
              <AdminModeratePosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/admin"
          element={
            <ProtectedRoute>
              <UserMessagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/user-chat"
          element={
            <ProtectedRoute>
              <UserMessagePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
