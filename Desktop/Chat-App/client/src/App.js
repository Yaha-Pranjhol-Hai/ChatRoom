import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const socket = socketIOClient('http://localhost:5000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/messages')
      .then(response => {
        setMessages(response.data);
      });

    socket.on('chat message', msg => {
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    const msg = { username, message };
    socket.emit('chat message', msg);
    setMessage('');
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Message" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
