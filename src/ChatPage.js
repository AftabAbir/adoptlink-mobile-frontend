// src/ChatPage.js
import React, { useEffect, useRef, useState } from 'react';
import axios from "./axiosConfig"; // your axios instance with baseURL
import './ChatPage.css'; // keep or create styling similar to UserMessagePage.css
import { useNavigate, useLocation } from 'react-router-dom';

/* ---------- Helpers to parse/format server timestamps ---------- */
function parseServerDate(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }
  if (typeof value === 'string') {
    // Try ISO first
    let d = new Date(value);
    if (!isNaN(d)) return d;
    // Try replacing space with 'T' (your Option B: "2025-11-05 14:51:00")
    d = new Date(value.replace(' ', 'T'));
    if (!isNaN(d)) return d;
    // Try remove milliseconds formatting issues
    const trimmed = value.split('.')[0].replace(' ', 'T');
    d = new Date(trimmed);
    if (!isNaN(d)) return d;
    return null;
  }
  if (typeof value === 'object') {
    const { year, month, day, hour = 0, minute = 0, second = 0, nano } = value;
    if (year && month && day) {
      const msFromNanos = nano ? Math.floor(nano / 1e6) : 0;
      const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second, msFromNanos));
      return isNaN(d) ? null : d;
    }
  }
  return null;
}

function formatTimestamp(value) {
  const d = parseServerDate(value);
  if (!d) return '';
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth() &&
                  d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString();
}

/* ---------- ChatPage component ---------- */
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user'));
  const { receiverId, animalId, receiverName, animalName, fromPage } = location.state || {};
  // fallback values (safety)
  const senderId = user?.id;
  const toId = receiverId;

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const msgBoxRef = useRef(null);
  const pollingRef = useRef(null);

  // whether user is near bottom (so we know whether to auto-scroll after updates)
  const isUserNearBottom = (thresholdPx = 120) => {
    const box = msgBoxRef.current;
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight <= thresholdPx;
  };

  const scrollToBottom = (smooth = true) => {
    const box = msgBoxRef.current;
    if (!box) return;
    if (smooth) {
      box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    } else {
      box.scrollTop = box.scrollHeight;
    }
    setShowScrollBtn(false);
  };

  // fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages', {
        params: { senderId, receiverId: toId, animalId }
      });
      const newMsgs = Array.isArray(res.data) ? res.data : [];

      const wasNearBottom = isUserNearBottom();

      setMessages(newMsgs);
      // mark read if needed (best-effort) -- backend should support such endpoint if you want
      // skip here to avoid extra coupling; if you have mark-read endpoint you can call it.

      if (wasNearBottom) {
        // wait a tiny bit so DOM updates, then scroll
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const checkUnread = async () => {
    try {
      // Optional: reuse the admin unread endpoint pattern (if you have generic unread)
      // Example: GET /api/messages/unread?receiverId=<id>
      const res = await axios.get(`/api/messages/unread?receiverId=${senderId}`);
      if (res.data && res.data.length > 0) setHasUnread(true);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    // initial load
    fetchMessages();
    checkUnread();
    // polling every 4-5s
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId, animalId, senderId]);

  // show/hide scroll button when user scrolls
  useEffect(() => {
    const box = msgBoxRef.current;
    if (!box) return;
    const onScroll = () => {
      const near = isUserNearBottom(140);
      setShowScrollBtn(!near);
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    // run once
    onScroll();
    return () => box.removeEventListener('scroll', onScroll);
  }, []);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      // send text/plain as your backend expects
      await axios.post('/api/messages', content, {
        params: { senderId, receiverId: toId, animalId },
        headers: { 'Content-Type': 'text/plain' }
      });
      setContent('');
      // fetch new messages and attempt to preserve user's position logic
      const wasNearBottom = isUserNearBottom();
      await fetchMessages();
      if (wasNearBottom) setTimeout(() => scrollToBottom(true), 80);
    } catch (err) {
      console.error('Failed to send', err);
      setError('Failed to send message.');
    }
  };

  // small helper for last-seen logic
  // const getLastSeenText = () => {
  //   if (!messages.length) return '';
  //   const last = messages[messages.length - 1];
  //   const timeVal = last?.createdAt ?? last?.timestamp ?? last?.sentAt ?? null;
  //   const d = parseServerDate(timeVal);
  //   if (!d) return 'Last seen: -';
  //   const secondsAgo = (Date.now() - d.getTime()) / 1000;
  //   if (secondsAgo < 60) return 'Online now';
  //   return `Last seen ${formatTimestamp(timeVal)}`;
  // };

  const getLastSeenText = () => {
  if (!messages.length) return '';

  // find the latest message sent by the RECEIVER
  const receiverMsgs = messages
    .filter(m => m.sender?.id === receiverId)
    .sort((a, b) => {
      const ta = parseServerDate(a.createdAt ?? a.timestamp ?? a.sentAt ?? null)?.getTime() || 0;
      const tb = parseServerDate(b.createdAt ?? b.timestamp ?? b.sentAt ?? null)?.getTime() || 0;
      return tb - ta;
    });

  if (receiverMsgs.length === 0) return "Last seen: -";

  const last = receiverMsgs[0];
  const timeVal = last.createdAt ?? last.timestamp ?? last.sentAt ?? null;
  const d = parseServerDate(timeVal);

  if (!d) return "Last seen: -";

  const secondsAgo = (Date.now() - d.getTime()) / 1000;
  if (secondsAgo < 60) return "Online now";

  return `Last seen ${formatTimestamp(timeVal)}`;
};


  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(fromPage || '/dashboard')}>←</button>

        <img className="chat-avatar" src="/logo192.png" alt="avatar" />

        <div className="chat-header-info">
          <div className="chat-title">
            {receiverName || 'Chat'}
            {animalName ? <span className="chat-sub"> — {animalName}</span> : null}
          </div>
          <div className="chat-status">{getLastSeenText()}</div>
        </div>

        {/* {hasUnread && <div className="notification-dot">🔴</div>} */}
      </div>

      {/* Message list */}
      <div className="chat-box" ref={msgBoxRef} role="log" aria-live="polite">
        {loading ? (
          <div className="center-note">Loading messages…</div>
        ) : error ? (
          <div className="center-note error">{error}</div>
        ) : messages.length === 0 ? (
          <div className="center-note">No messages yet — say hi 👋</div>
        ) : (
          messages.map((msg) => {
            const sentByMe = msg.sender?.id === senderId;
            const timeVal = msg.createdAt ?? msg.timestamp ?? msg.sentAt ?? null;
            return (
              <div
                className={`chat-msg-wrap ${sentByMe ? 'sent' : 'received'}`}
                key={msg.id ?? Math.random()}
              >
                <img className="msg-avatar" src="/logo192.png" alt="avatar" />
                <div className="chat-bubble animated-msg">
                  <div className="chat-text">{msg.content}</div>
                  <div className="chat-time">{formatTimestamp(timeVal)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scroll-to-bottom */}
      {showScrollBtn && (
        <button className="scroll-to-bottom" onClick={() => scrollToBottom(true)} title="Scroll to bottom">↓</button>
      )}

      {/* Input */}
      <div className="chat-input">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
