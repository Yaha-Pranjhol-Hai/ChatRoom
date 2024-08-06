import React from "react";
import ChatPage from "../components/ChatPage";
import RegistrationForm from "../components/Register";

const Dashboard = () => {
  return (
    <div className="container" style={{ display: "flex", paddingTop: "20px", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
      <h2>Dashboard</h2>
      <div className="column" style={{ width: "100%", maxWidth: "1200px" }}>
        <div>
          <RegistrationForm />
        </div>
        <div>
          <ChatPage />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
