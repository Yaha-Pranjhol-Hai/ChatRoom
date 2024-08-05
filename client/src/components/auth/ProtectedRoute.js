import React , { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";
import Cookies from "js-cookie";

const ProtectedRoute  = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);
    const authToken = Cookies.get('authToken');

    useEffect(() => {
        const checkAuth = async() => {
            const auth = await isAuthenticated();
            setIsAuth(auth);
        }
        
        checkAuth();
    }, [])

    if(!authToken) {
        return <Navigate to="/"/>
    }


    if(isAuth === null) {
        return <div>Loading...</div>;
    }

    return isAuth ? children : <Navigate to="/login"/>
}

export default ProtectedRoute;