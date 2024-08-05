import React, { createContext, useState, useContext } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('authToken'));

    const login = () => setIsLoggedIn(true);
    const logout = () => {
        Cookies.remove('authToken');
        setIsLoggedIn(false);
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
