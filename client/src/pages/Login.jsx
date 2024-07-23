import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:3001/api/login",
                { email: credentials.email, password: credentials.password },
                { withCredentials: true } // Ensures cookies are sent with the request
            );
            const json = response.data;
            console.log(json);

            if (json.success) {
                navigate("/");
                console.log("Logged in Successfully", "success");
            } else {
                console.error("Invalid details", "danger");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    return (
        <div>
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
                        id="password"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}

export default Login;
