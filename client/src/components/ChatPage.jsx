import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/rooms/userrooms", { withCredentials: true });
        if (response.data.success) {
          setRooms(response.data.rooms);
        } else {
          console.error("Failed to fetch rooms", response.data.error);
        }
      } catch (error) {
        console.error("Failed to fetch rooms", error.response ? error.response.data : error.message);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomChange = (event) => {
    setSelectedRoomId(event.target.value);
  };

  const handleJoinRoom = () => {
    if (selectedRoomId) {
      navigate(`/chatroom/${selectedRoomId}`);
    }
  };

  return (
    <div style={{ width: "100%", margin: "auto", padding: "1rem" }}>
      <h2>Chat Page</h2>
      <select
        value={selectedRoomId}
        onChange={handleRoomChange}
        className="form-control mb-3"
      >
        <option value="">Select a Room</option>
        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            {room.name}
          </option>
        ))}
      </select>
      <button
        className="btn btn-primary"
        onClick={handleJoinRoom}
        disabled={!selectedRoomId}
      >
        Select Room
      </button>
    </div>
  );
};

export default ChatPage;
