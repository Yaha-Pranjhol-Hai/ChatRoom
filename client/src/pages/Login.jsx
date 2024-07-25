import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

function Login() {
  // Initialize the state for email and password as empty strings
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [chats, setChats] = useState([]);
  let navigate = useNavigate();
  let socket;

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
        setIsAuthenticated(true);
        navigate("/");
        console.log("Logged in Successfully", "success");
      } else {
        console.error("Invalid details", "danger");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if(isAuthenticated) {
        socket =  io('http://localhost:3001', {
            auth: {
                token: document.cookie.split('=')[1]
            }
        });
        socket.on('connect', () => {
            console.log("Connected to server");

            socket.emit('fetchChats', (response) => {
                if(response.success) {
                    setChats(response.chats);
                }
                else {
                    console.error('Failed to fetch chats', response.error);
                }
            });
        })

        socket.on('newMessage', (chat) => {
            setChats((prevChats) => [...prevChats, chat])
        })

        socket.on('disconnect', () => {
            console.log("Disconnected from server");
        })

        return () => {
            socket.disconnect();
        }
    }
  }, [isAuthenticated]);

  const sendMessage = (message) => {
    if(socket) {
        socket.emit('sendMessage', message, (response) => {
            if(!response.success) {
                console.error('Failed to send message', response.error);
            }
        })
    }
  }

  return (
    <div style={{ width: '50%', margin: 'auto', padding: '1rem' }}>
      {!isAuthenticated ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={onChange}
              className="form-control"
              id="email"
              name="email"
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={onChange}
              className="form-control"
              name="password"
              placeholder=""
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      ) : (
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
  );
}

export default Login;