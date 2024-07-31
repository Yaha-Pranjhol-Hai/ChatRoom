import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/rooms', { withCredentials: true });
      const json = response.data;
      if (json.success) {
        setRooms(json.rooms);
      } else {
        console.error('Failed to fetch rooms', json.error);
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error.response ? error.response.data : error.message);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/rooms/all', { withCredentials: true });
      const json = response.data;
      if (json.success) {
        setAvailableRooms(json.rooms);
      } else {
        console.error('Failed to fetch available rooms', json.error);
      }
    } catch (error) {
      console.error('Failed to fetch available rooms', error.response ? error.response.data : error.message);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/rooms/join/${roomId}`, {}, { withCredentials: true });
      const json = response.data;
      if (json.success) {
        fetchRooms();  // Refresh the list of rooms
        navigate('/chat'); 
      } else {
        console.error('Failed to join room', json.error);
      }
    } catch (error) {
      console.error('Failed to join room', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchAvailableRooms();
  }, []);

  return (
    <div>
      <h2>Rooms You Are Invited To</h2>
      <ul>
        {rooms.map(room => (
          <li key={room._id}>{room.name}</li>
        ))}
      </ul>

      <h2>All Available Rooms</h2>
      <select onChange={(e) => setSelectedRoom(e.target.value)}>
        <option value="">Select a room</option>
        {availableRooms.map(room => (
          <option key={room._id} value={room._id}>{room.name}</option>
        ))}
      </select>
      <button onClick={() => joinRoom(selectedRoom)}>Join Room</button>
    </div>
  );
}

export default Home;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function Home() {
//   const [rooms, setRooms] = useState([]);
//   const [availableRooms, setAvailableRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState('');

//   const fetchRooms = async () => {
//     try {
//       const response = await axios.get('http://localhost:3001/api/rooms', {
//         withCredentials: true
//       });
//       const json = response.data;
//       if (json.success) {
//         setRooms(json.rooms);
//       } else {
//         console.error('Failed to fetch rooms', json.error);
//       }
//     } catch (error) {
//       console.error('Failed to fetch rooms', error.response ? error.response.data : error.message);
//     }
//   };

//   const fetchAvailableRooms = async () => {
//     try {
//       const response = await axios.get('http://localhost:3001/api/rooms/all', {
//         withCredentials: true
//       });
//       const json = response.data;
//       if (json.success) {
//         setAvailableRooms(json.rooms);
//       } else {
//         console.error('Failed to fetch available rooms', json.error);
//       }
//     } catch (error) {
//       console.error('Failed to fetch available rooms', error.response ? error.response.data : error.message);
//     }
//   };

//   const joinRoom = async (roomId) => {
//     try {
//       const response = await axios.post(`http://localhost:3001/api/rooms/join/${roomId}`, {}, {
//         withCredentials: true
//       });
//       const json = response.data;
//       if (json.success) {
//         console.log('Joined room successfully');
//         fetchRooms();  // Refresh the list of rooms
//       } else {
//         console.error('Failed to join room', json.error);
//       }
//     } catch (error) {
//       console.error('Failed to join room', error.response ? error.response.data : error.message);
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//     fetchAvailableRooms();
//   }, []);

//   return (
//     <div>
//       <h2>Rooms You Are Invited To</h2>
//       <ul>
//         {rooms.map(room => (
//           <li key={room._id}>{room.name}</li>
//         ))}
//       </ul>

//       <h2>All Available Rooms</h2>
//       <select onChange={(e) => setSelectedRoom(e.target.value)}>
//         <option value="">Select a room</option>
//         {availableRooms.map(room => (
//           <option key={room._id} value={room._id}>{room.name}</option>
//         ))}
//       </select>
//       <button onClick={() => joinRoom(selectedRoom)}>Join Room</button>
//     </div>
//   );
// }

// export default Home;
