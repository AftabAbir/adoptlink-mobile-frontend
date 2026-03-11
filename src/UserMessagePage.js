// src/UserMessagePage.js
import React, { useEffect, useRef, useState } from "react";
import axios from "./axiosConfig";
import "./UserMessagePage.css";
import { useLocation, useNavigate } from "react-router-dom";

function parseServerDate(value) {
  if (!value) return null;

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d)) return d;

    const d2 = new Date(value.replace(" ", "T"));
    if (!isNaN(d2)) return d2;

    return null;
  }

  if (typeof value === "object") {
    const { year, month, day, hour = 0, minute = 0, second = 0, nano } = value;
    if (year && month && day) {
      const ms = nano ? Math.floor(nano / 1e6) : 0;
      const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
      return isNaN(d) ? null : d;
    }
  }

  return null;
}

function formatTimestamp(value) {
  const d = parseServerDate(value);
  if (!d) return "";

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleString();
}

export default function UserMessagePage() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // 🔥 NEW: user status state
  const [receiverStatus, setReceiverStatus] = useState({
    online: false,
    lastSeen: null,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  const receiverId = isAdmin ? location.state?.userId : 21; // admin id
  const receiverName = isAdmin ? location.state?.userName : "Admin";
  const fromPage = location.state?.fromPage || "/dashboard";

  const msgBoxRef = useRef(null);
  const pollingRef = useRef(null);

  const isUserNearBottom = (thresholdPx = 120) => {
    const box = msgBoxRef.current;
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight <= thresholdPx;
  };

  const scrollToBottom = (smooth = true) => {
    const box = msgBoxRef.current;
    if (!box) return;

    if (smooth) {
      box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
    } else {
      box.scrollTop = box.scrollHeight;
    }
    setShowScrollBtn(false);
  };

  const fetchMessages = async () => {
    try {
      const wasNearBottom = isUserNearBottom();

      const res = await axios.get("/api/admin-messages/conversation", {
        params: { user1Id: currentUser.id, user2Id: receiverId },
      });

      setMessages(Array.isArray(res.data) ? res.data : []);

      await axios.put("/api/admin-messages/mark-read", null, {
        params: { senderId: receiverId, receiverId: currentUser.id },
      });

      if (wasNearBottom) {
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };
  //=====================================================
  useEffect(() => {
  if (!receiverId) {
    console.error("Receiver ID missing");
    return;
  }

  fetchMessages();
  fetchReceiverStatus();

  pollingRef.current = setInterval(() => {
    fetchMessages();
    fetchReceiverStatus();
  }, 5000);

  return () => clearInterval(pollingRef.current);
}, [receiverId]);

  //=====================================================

  // 🔥 NEW: Fetch online / lastSeen status
  const fetchReceiverStatus = async () => {
    try {
      const res = await axios.get(`/api/users/${receiverId}/status`);
      setReceiverStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch user status");
    }
  };

  // useEffect(() => {
  //   fetchMessages();
  //   fetchReceiverStatus();

  //   pollingRef.current = setInterval(() => {
  //     fetchMessages();
  //     fetchReceiverStatus();
  //   }, 5000);

  //   return () => clearInterval(pollingRef.current);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    const box = msgBoxRef.current;
    if (!box) return;

    const onScroll = () => {
      const near = isUserNearBottom(140);
      setShowScrollBtn(!near);
    };

    box.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => box.removeEventListener("scroll", onScroll);
  }, []);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      const wasNearBottom = isUserNearBottom();

      await axios.post("/api/admin-messages/send", content, {
        params: { senderId: currentUser.id, receiverId },
        headers: { "Content-Type": "text/plain" },
      });

      setContent("");
      await fetchMessages();

      if (wasNearBottom) {
        setTimeout(() => scrollToBottom(true), 100);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send message.");
    }
  };

  const getMsgCreatedAt = (msg) =>
    msg?.createdAt ?? msg?.timestamp ?? msg?.sentAt ?? null;

  return (
    <div className="user-message-container">
      <div className="chat-header">
        <button className="back-arrow" onClick={() => navigate(fromPage)}>
          ←
        </button>

        <img className="chat-avatar" src="/logo192.png" alt="avatar" />

        <div className="chat-header-info">
          <h3>{receiverName}</h3>
          <div className="online-status">
            {receiverStatus.online
              ? "Online now"
              : receiverStatus.lastSeen
              ? `Last seen ${formatTimestamp(receiverStatus.lastSeen)}`
              : "Last seen: -"}
          </div>
        </div>
      </div>

      <div className="message-box" ref={msgBoxRef}>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading messages…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No messages yet — say hi 👋
          </p>
        ) : (
          messages.map((msg) => {
            const sentByMe = msg.sender?.id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`message-wrapper ${
                  sentByMe ? "sent" : "received"
                }`}
              >
                <div className="message">
                  <div className="message-content">{msg.content}</div>
                  <div className="timestamp">
                    {formatTimestamp(getMsgCreatedAt(msg))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showScrollBtn && (
        <button className="scroll-btn" onClick={() => scrollToBottom(true)}>
          ↓
        </button>
      )}

      <div className="chat-input">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
