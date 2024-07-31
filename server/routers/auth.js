import User from '../models/user.model.js';
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import fetchuser from "../middleware/fetchuser.js";

const router = Router();

// Route 1 on http://localhost:5000/api/createuser
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req,res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if(user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists."})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email,
        });
        const data = {
            user: {
                id: user.id
            }
        }

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        };

        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;
        res.cookie("authToken", authtoken, options).json({success})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 2 on http://localhost:5000/api/login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req,res) => {
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({success, error: "Please try to login with the correct credentials."});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare) {
            success = false;
            return res.status(400).json({success, error: "Please try to login with the correct credentials."});
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        };

        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        success = true,
        res.cookie("authToken", authtoken , options).json({success})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error")
    }
})

// Route 3 Authnticate a User on http://localhost:5000/api/getuser. Login required.
router.post('/getuser', fetchuser, async (req,res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
} )

export default router;