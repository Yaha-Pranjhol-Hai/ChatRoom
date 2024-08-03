import axios from "axios";
import Cookies from "js-cookie";

export const isAuthenticated = async () => {
    const token = Cookies.get("authToken");

    if(!token) {
        return false;
    }

    try {
        const response = await axios.get("http://localhost:3001/api/validateToken", {
            withCredentials: true,
        });
        return response.data.success;
    } catch (error) {
        console.error("Token validation error: ", error.response ? error.response.data : error.message);
        return false;
    }
}