// src/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axiosConfig";
import "./Dashboard.css";
//=========================
import { logoutUser } from "./utils/logout";
//=============================

function Dashboard() {
  const [hasUnread, setHasUnread] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);
  const [rescueCount, setRescueCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
//========================================================
  // const handleLogout = () => {
  //   localStorage.clear();
  //   navigate("/login");
  // };

  // 🔥 UPDATED LOGOUT HANDLER
  const handleLogout = async () => {
    await logoutUser();          // mark user offline
    navigate("/login");
  };

  /* -------- MARK USER OFFLINE WHEN TAB / BROWSER CLOSES -------- */
  useEffect(() => {
    const handleUnload = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      navigator.sendBeacon(
        `/api/users/${user.id}/offline`
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

//==============================================================

  /* -------- FETCH UNREAD ADMIN MESSAGES -------- */
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (user?.id && user?.role !== "admin") {
        try {
          const response = await axios.get(
            `/api/admin-messages/unread?receiverId=${user.id}`
          );
          if (response.data.length > 0) setHasUnread(true);
        } catch (error) {
          console.error("Error fetching unread messages:", error);
        }
      }
    };
    fetchUnreadMessages();
  }, [user]);

  /* -------- FETCH ACHIEVEMENTS COUNT (ADMIN ONLY) -------- */
  useEffect(() => {
    if (user?.role !== "admin" || !user?.id) return;

    Promise.all([
      axios.get(`/api/animals/adopted?requesterId=${user.id}`),
      axios.get(`/api/animals/rescued?adminId=${user.id}`)
    ])
      .then(([adoptedRes, rescuedRes]) => {
        const adoptedCount = adoptedRes.data?.length || 0;
        const rescuedCount = rescuedRes.data?.length || 0;
        setAchievementCount(adoptedCount + rescuedCount);
      })
      .catch(err => {
        console.error("Failed to load achievement count", err);
      });
  }, [user]);

  /* -------- FETCH RESCUE POSTS COUNT (ADMIN ONLY) -------- */
  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchRescueCount = async () => {
      try {
        const response = await axios.get("/api/animals/post-type/rescue");

        const activeRescues = response.data.filter(
          animal => !animal.rescued
        );

        const pending = activeRescues.filter(
          animal => !animal.rescueAccepted
        ).length;

        const accepted = activeRescues.filter(
          animal => animal.rescueAccepted
        ).length;

        setRescueCount(pending + accepted);
      } catch (err) {
        console.error("Failed to load rescue count", err);
      }
    };

    fetchRescueCount();
  }, [user]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AdoptLink</h1>
        <button className="logout-button" onClick={handleLogout}>
          <span className="button-icon">🚪</span>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <h2>👋 Welcome, {user?.name || "Guest"}</h2>

        <div className="dashboard-buttons">

          {/* -------- COMMON -------- */}
          <button onClick={() => navigate("/adoption-posts")}>
            <span className="button-icon">🐶</span>
            <span>Adoption Posts</span>
          </button>

          <button onClick={() => navigate("/profile")}>
            <span className="button-icon">👤📝</span>
            <span>My Posts</span>
          </button>

          <button onClick={() => navigate("/post-animal")}>
            <span className="button-icon">📤</span>
            <span>Post Animal</span>
          </button>

          <button onClick={() => navigate("/my-requests")}>
            <span className="button-icon">📋</span>
            <span>My Requests</span>
          </button>

          <button onClick={() => navigate("/incoming-requests")}>
            <span className="button-icon">📥</span>
            <span>Incoming Requests</span>
          </button>

          {/* -------- USER CHAT -------- */}
          {user?.role !== "admin" && (
            <button onClick={() => navigate("/messages/admin")}>
              <span className="button-icon">💬</span>
              <span>
                Admin Chat{" "}
                {hasUnread && (
                  <span className="notification-dot" title="New message">
                    🔴
                  </span>
                )}
              </span>
            </button>
          )}

          {/* -------- ADMIN PANEL -------- */}
          {user?.role === "admin" && (
            <>
              <h3>🛠 Admin Panel</h3>

              <button onClick={() => navigate("/admin/users")}>
                <span className="button-icon">👥</span>
                <span>All Users</span>
              </button>

              <button onClick={() => navigate("/admin/achievements")}>
                <span className="button-icon">🏆</span>
                <span>
                  Achievements
                  {achievementCount > 0 && (
                    <span className="tab-badge">
                      {" "}({achievementCount})
                    </span>
                  )}
                </span>
              </button>

              <button onClick={() => navigate("/admin/moderate-posts")}>
                <span className="button-icon">🧹</span>
                <span>Moderate</span>
              </button>

              <button onClick={() => navigate("/rescue-posts")}>
                <span className="button-icon">🐾</span>
                <span>
                  Rescue Posts
                  {rescueCount > 0 && (
                    <span className="tab-badge">
                      {" "}({rescueCount})
                    </span>
                  )}
                </span>
              </button>
            </>
          )}

        </div>
      </main>

      <footer>
        <p>© 2025 AdoptLink — Connecting hearts with paws 🐾</p>
      </footer>
    </div>
  );
}

export default Dashboard;
