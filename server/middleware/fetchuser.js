import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const fetchuser = async (req, res, next) => {
    // Extract token from Authorization header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.authToken;

    console.log('Token:', token);

    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ error: "Please authenticate using a valid Token...." });
    }

    try {
        // Verify the token
        const data = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database
        const user = await User.findById(data.user.id);

        // If user is not found, return an error
        if (!user) {
            console.error('User not found');
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Set the user in the request object
        req.user = data.user;
        console.log('Authenticated User:', req.user);
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ error: "Please authenticate using a valid Token" });
    }
}

export default fetchuser;
