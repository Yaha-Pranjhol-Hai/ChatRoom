import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";

export const useAuth = () => {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await isAuthenticated();
            setIsAuth(auth);
        };

        checkAuth();
    }, []);
    return isAuth;
}