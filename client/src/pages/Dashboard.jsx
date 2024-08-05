import React, { useState } from "react";
import ChatPage from "../components/ChatPage";
import RegistrationForm from "../components/Register";
import ChatRoom from "../components/ChatRoom";

const Dashboard = ({ userId }) => {
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="container" style={{ display: "flex", paddingTop: "20px", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
      <h2>Dashboard</h2>
      <div className="column" style={{ width: "100%", maxWidth: "1200px" }}>
        <div>
          <RegistrationForm />
        </div>
        <div>
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} userId={userId} />
          ) : (
            <ChatPage onRoomSelect={handleRoomSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
