import React from "react";
import ChatPage from "../components/Chat";
import RegistrationForm from "../components/Register";

const Dashboard = () => {
  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="row">
        <div className="col-md-6">
          <RegistrationForm />
        </div>
        <div className="col-md-6">
          <ChatPage />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
