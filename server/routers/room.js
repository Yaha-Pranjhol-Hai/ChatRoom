import fetchuser from "../middleware/fetchuser.js";
import Room from '../models/room.model.js';
import { Router } from "express";

const router = Router();

// Create a Room
router.post('/createroom', fetchuser, async (req,res) => {
    try {
        const { name, invitedUsers } = req.body;
        const newRoom = new Room({
            name,
            createdBy: req.user.id,
            invitedUsers
        })

        const savedRoom = await newRoom.save();
        res.json({ success: true, room: savedRoom });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route to fetch rooms where the user is invited.
router.get('/', fetchuser, async (req, res) => {
    try {
        const rooms = await Room.find({ invitedUsers: req.user.id }).populate('createdBy', 'name email');
        res.json({ success: true, rooms});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error.");
    }
})

export default router;
