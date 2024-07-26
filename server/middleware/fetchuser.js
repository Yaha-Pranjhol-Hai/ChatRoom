import jwt from 'jsonwebtoken';

const fetchuser = (req,res, next) => {
    // const token = req.header('auth-token');
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.authtoken;
    console.log('Token:', token);
    if(!token) {
        console.error('No token provided');
        res.status(401).send({error: "Please authenticate using a valid Token"})
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        console.log('Authenticated User:', req.user);
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ error: "Please authenticate using a valid Token"})
    }
}

export default fetchuser;