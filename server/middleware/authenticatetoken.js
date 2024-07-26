import User from "../models/user.model";
import jwt from "jsonwebtoken";


export const authenticateToken = async (req,res, next) => {
    try {
        const token = req.cookies?.authtoken || 
        req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            return res.status(401).json({ error: "Sorry, couldn't find the token."})
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password");
    
        if(!user) {
            return res.status(403).json({ error: "User not found."});
        }
    
        req.user = user;
        next();
    } catch (error) {
        return res.status(402).json({ error: "Unexpected Error found."})
    }

}