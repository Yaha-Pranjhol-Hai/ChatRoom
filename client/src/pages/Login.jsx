import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useSocket } from "../context/SocketProvider";

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [chats, setChats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const navigate = useNavigate();
  const socket = useSocket();

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/login",
        { email: credentials.email, password: credentials.password },
        { withCredentials: true }
      );
      const json = response.data;

      if (json.success) {
        navigate("/"); // Redirect to home
        console.log("Logged in Successfully");
        const authtoken = response.data.token;
        setAuthToken(authtoken);
        fetchRooms(); // Fetch the rooms after logging in
        fetchAvailableRooms(); // Fetch available rooms after logging in
        setupSocket(authtoken); // Set up the socket connection after logging in
      } else {
        console.error("Invalid details");
      }
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
    }
  };

  // Handle input changes for login
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Fetch rooms the user is invited to
  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/rooms", {
        withCredentials: true
      });
      const json = response.data;
      if (json.success) {
        setRooms(json.rooms);
      } else {
        console.error("Failed to fetch rooms", json.error);
      }
    } catch (error) {
      console.error("Failed to fetch rooms", error.response ? error.response.data : error.message);
    }
  };

  // Fetch all available rooms
  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/rooms/all", {
        withCredentials: true
      });
      const json = response.data;
      if (json.success) {
        setAvailableRooms(json.rooms);
      } else {
        console.error("Failed to fetch available rooms", json.error);
      }
    } catch (error) {
      console.error("Failed to fetch available rooms", error.response ? error.response.data : error.message);
    }
  };

  // Fetch chats for the selected room
  const fetchInitialChats = useCallback(async () => {
    if (selectedRoomId) {
      try {
        const response = await axios.get(`http://localhost:3001/api/chat/room/${selectedRoomId}`, {
          withCredentials: true
        });
        const json = response.data;
        if (json.success) {
          setChats(json.messages);
        } else {
          console.error('Failed to fetch chats', json.error);
        }
      } catch (error) {
        console.error("Failed chats error", error.response ? error.response.data : error.message);
      }
    }
  }, [selectedRoomId]);

  // Set up socket connection
  const setupSocket = (token) => {
    console.log('Auth token', token);  // This is because we cant access the token from javascript in th console section of the browser. So this will be undefined.
    const socketInstance = io('http://localhost:3001', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('newMessage', (chat) => {
      setChats((prevChats) => [...prevChats, chat]);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.current = socketInstance;

    return () => {
      socketInstance.disconnect();
    };
  };

  // Join room and set up socket listeners
  useEffect(() => {
    if (selectedRoomId && socket.current) {
      socket.current.emit('joinRoom', { roomId: selectedRoomId });

      socket.current.on('roomJoined', (response) => {
        if (!response.success) {
          console.error('Failed to join room', response.error);
        }
      });

      fetchInitialChats();
    }
  }, [socket, selectedRoomId, fetchInitialChats]);

  const joinRoom = (roomId) => {
    if (roomId && socket.current) {
      socket.current.emit('joinRoom', { roomId });
  
      socket.current.on('roomJoined', (response) => {
        if (response.success) {
          console.log('Successfully joined the room');
          fetchInitialChats(); // Fetch initial chats for the room
        } else {
          console.error('Failed to join room', response.error);
        }
      });
    }
  };

  // Send message
  const sendMessage = (message) => {
    if (socket.current) {
      socket.current.emit('sendMessage', { message, roomId: selectedRoomId }, (response) => {
        if (!response.success) {
          console.error('Failed to send message', response.error);
        }
      });
    }
  };

  return (
    <div style={{ width: '50%', margin: 'auto', padding: '1rem' }}>
      {!authToken ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              value={credentials.email}
              onChange={onChange}
              className="form-control"
              id="email"
              name="email"
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={onChange}
              className="form-control"
              name="password"
              placeholder=""
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      ) : (
        <div>
          <h2>Rooms You Are Invited To</h2>
          <ul>
            {rooms.map((room) => (
              <li key={room._id}>{room.name}</li>
            ))}
          </ul>

          <h2>All Available Rooms</h2>
          <select onChange={(e) => setSelectedRoomId(e.target.value)}>
            <option value="">Select a room</option>
            {availableRooms.map((room) => (
              <option key={room._id} value={room._id}>{room.name}</option>
            ))}
          </select>
          <button onClick={() => joinRoom(selectedRoomId)}>Join Room</button>

          {selectedRoomId && (
            <div>
              <h2>Your Chats</h2>
              <ul>
                {chats.map((chat) => (
                  <li key={chat._id}>{chat.message}</li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;
