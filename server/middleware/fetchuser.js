import jwt from 'jsonwebtoken';

const fetchuser = (req,res, next) => {
    // const token = req.header('auth-token');
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.authtoken;
    if(!token) {
        res.status(401).send({error: "Please authenticate using a valid Token"})
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Please authenticate using a valid Token"})
    }
}

export default fetchuser;

// Check for endpoints