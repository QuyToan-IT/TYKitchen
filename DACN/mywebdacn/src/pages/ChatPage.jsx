import React, { useState, useEffect, useCallback, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./chat.css";

const ChatPage = ({ token, currentUserId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userProfiles, setUserProfiles] = useState({});
  const stompClientRef = useRef(null);
  const fetchedIds = useRef(new Set());

  // Lấy thông tin user từ backend
  const fetchUserProfile = useCallback(
    async (id) => {
      if (!id || fetchedIds.current.has(id)) return;
      fetchedIds.current.add(id);
      try {
        const res = await fetch(`/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfiles((prev) => ({
            ...prev,
            [id]: {
              fullName: data.fullName,
              avatarUrl: data.avatarUrl,
            },
          }));
        }
      } catch (err) {
        console.error("Lỗi lấy user profile:", err);
      }
    },
    [token]
  );

  // Lấy conversation khi mở chat
  useEffect(() => {
    console.log("currentUserId:", currentUserId);
    console.log("userId:", userId);
    if (!userId) return;

    const fetchConversation = async () => {
      if (!currentUserId) return;
      try {
        const res = await fetch(
          `/api/v1/chat/conversation?user1=${currentUserId}&user2=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          const uniqueIds = new Set();
          data.forEach((msg) => {
            uniqueIds.add(msg.senderId);
            uniqueIds.add(msg.receiverId);
          });
          uniqueIds.forEach((id) => fetchUserProfile(id));
        }
      } catch (err) {
        console.error("Lỗi lấy conversation:", err);
      }
    };

    const run = async () => {
      await fetchUserProfile(userId);
      if (currentUserId) await fetchUserProfile(currentUserId);
      await fetchConversation();
    };

    run();
  }, [currentUserId, userId, token, fetchUserProfile]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!currentUserId || !token) return;

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8888/ws-chat"),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });


    client.onConnect = () => {
      console.log("Connected to WebSocket");
      stompClientRef.current = client;

      client.subscribe(`/user/${currentUserId}/queue/messages`, (frame) => {
        const msg = JSON.parse(frame.body);
        setMessages((prev) => [...prev, msg]);
        fetchUserProfile(msg.senderId);
        fetchUserProfile(msg.receiverId);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [currentUserId, fetchUserProfile, token]);

  // Gửi tin nhắn qua WebSocket
  const sendMessage = () => {
    if (!input.trim() || !stompClientRef.current?.connected) return;

    const message = {
      senderId: currentUserId,
      receiverId: userId,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    stompClientRef.current.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  // Xử lý avatar
  const getAvatarSrc = (url) => {
    if (!url) return "/image/user.png";
    if (url.includes("googleusercontent.com")) return url.replace(/=s\d+(-c)?/g, "=s400-c");
    if (url.includes("graph.facebook.com")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}width=400&height=400`;
    }
    if (url.startsWith("http")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8888${path}`;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="title">
          <img
            src={getAvatarSrc(userProfiles[userId]?.avatarUrl)}
            alt={userProfiles[userId]?.fullName || "User"}
            className="avatar header-avatar"
            onError={(e) => { e.target.src = "/image/user.png"; }}
          />
          <div className="name">
            {userProfiles[userId]?.fullName || "Đang tải..."}
          </div>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => {
          const sender = userProfiles[msg.senderId];
          return (
            <div
              key={msg.id ? msg.id : `${msg.senderId}-${msg.timestamp || index}`}
              className={`bubble ${msg.senderId === currentUserId ? "me" : "them"}`}
            >
              <div className="bubble-header">
                <img
                  src={getAvatarSrc(sender?.avatarUrl)}
                  alt={sender?.fullName || `User ${msg.senderId}`}
                  className="avatar"
                  onError={(e) => { e.target.src = "/image/user.png"; }}
                />
                <span className="sender-name">
                  {sender?.fullName || `User ${msg.senderId}`}
                </span>
              </div>
              <div className="bubble-content">{msg.content}</div>
              <div className="timestamp">
                {msg.timestamp &&
                  new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatPage;
