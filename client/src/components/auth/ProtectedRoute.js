import React , { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const ProtectedRoute  = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);

    useEffect(() => {
        const checkAuth = async() => {
            const auth = await isAuthenticated();
            setIsAuth(auth);
        }
        
        checkAuth();
    }, [])

    if(isAuth === null) {
        return <div>Loading...</div>;
    }

    return isAuth ? children : <Navigate to="/login"/>
}

export default ProtectedRoute;