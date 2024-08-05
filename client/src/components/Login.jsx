import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import { useAuth } from "../context/AuthContext";

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/login",
        { email: credentials.email, password: credentials.password },
        { withCredentials: true }
      );
      const { success, token } = response.data;

      if (success) {
        Cookies.set('authtoken', token)
        login();
        navigate("/dashboard");
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


  return (
    <div style={{ width: '50%', margin: 'auto', padding: '1rem' }}>
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
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    </div>
  );
}

export default Login;
