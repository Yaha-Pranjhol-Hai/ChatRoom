import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const ChatRoom = () => {
  const { roomId } = useParams(); // Extract roomId from URL
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newUser, setNewUser] = useState("");
  const socket = useRef(null);
  const userId = "some-user-id"; // Replace with actual userId or pass it as a prop if needed

  useEffect(() => {
    socket.current = io("http://localhost:3001");
    socket.current.emit("joinRoom", { roomId, userId });

    socket.current.on("userJoined", ({ userId }) => {
      setNewUser(userId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.current.on("receiveMessage", (message) => {
      setChats((prevChats) => [...prevChats, message]);
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
      socket.current.disconnect();
    };
  }, [roomId, userId]);

  const sendMessage = () => {
    if (socket.current && newMessage.trim() !== "") {
      socket.current.emit(
        "sendMessage",
        { message: newMessage, roomId, userId },
        (response) => {
          if (!response.success) {
            console.error("Failed to send message", response.error);
          } else {
            setNewMessage("");
          }
        }
      );
    }
  };

  return (
    <div style={{ width: "100%", margin: "auto", padding: "1rem" }}>
      <h2>Chat Room</h2>
      {newUser && <div>New user joined: {newUser}</div>}
      <div>
        {chats.map((chat, index) => (
          <div key={index}>
            <strong>{chat.user.email}</strong>: {chat.message}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="form-control"
        />
        <button
          onClick={sendMessage}
          className="btn btn-primary"
          style={{ marginLeft: "1rem" }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
