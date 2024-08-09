import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import { useUser } from "../../context/UserContext";
import "./ChatRoom.css";

const ChatRoom = () => {
  const { roomId } = useParams();
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [joinedUsers, setJoinedUsers] = useState([]);
  const socket = useSocket();
  const chatEndRef = useRef(null);
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading || !socket || !user) return;
    const userId = user._id;
    console.log(`UseEffect: Emitting joinRoom event for user ${userId} to room ${roomId}`);

    socket.emit("joinRoom", { roomId, userId });

    socket.on("newMessage", (message) => {
      setChats((prevChats) => [...prevChats, message]);
    });

    socket.on("userJoined", ({ userId, name }) => {
      setJoinedUsers((prevUsers) => {
        if (!prevUsers.some(user => user.userId === userId)) {
          return [...prevUsers, { userId, name }];
        }
        return prevUsers;
      });
      console.log(`User ${name} joined room ${roomId}`);
    });
    
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/chats/room/${roomId}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setChats(response.data.messages);
        } else {
          console.error("Failed to fetch chats", response.data.error);
        }
      } catch (error) {
        console.error(
          "Failed to fetch chats",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchChats();

    return () => {
      socket.off("newMessage");
      socket.off("userJoined");
    };
  }, [roomId, user, loading, socket]);

  const sendMessage = () => {
    if (socket && newMessage.trim() !== "" && user) {
      const userId = user._id;
      socket.emit(
        "sendMessage",
        { message: newMessage, roomId, userId },
        (response) => {
          if (!response.success) {
            console.error("Failed to send message", response.error);
          } else {
            setNewMessage("");
            console.log(newMessage);
          }
        }
      );
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-room">
      <h2>Chat Room</h2>

      <div className="chat-users">
        <h4>Users in this room:</h4>
        <ul>
          {joinedUsers.map((user) => (
            <li key={user.userId}>{user.name}</li>
          ))}
        </ul>
      </div>

      <div className="chat-messages">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.user._id === user?._id ? "user-message" : "other-message"}`}
          >
            <strong>{chat.user.name}</strong>: {chat.message}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="form-control"
        />
        <button
          onClick={sendMessage}
          className="btn btn-primary"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
