import fetchuser from "../middleware/fetchuser.js";
import Room from '../models/room.model.js';
import { Router } from "express";

const router = Router();

// Create a Room
router.post('/createroom', fetchuser, async (req, res) => {
    try {
    const { name, invitedUsers } = req.body;
    if (!name || !invitedUsers) {
        console.log('Invalid data');
        return res.status(400).json({ success: false, error: "Invalid data" });
    }
    let room = await Room.findOne({ name });
        if (room) {
        invitedUsers.forEach(user => {
        if (!room.invitedUsers.includes(user)) {
            room.invitedUsers.push(user);
        }
        });
        room = await room.save();
    } else {
        room = new Room({ name, createdBy: req.user.id, invitedUsers });
        room = await room.save();
    }
    res.json({ success: true, room });
    } catch (error) {
    console.error('Error creating room:', error.message);
    res.status(500).send("Internal Server Error");
    }
});  

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

// Route to fetch all available rooms
router.get('/all', fetchuser, async (req, res) => {
    try {
        const rooms = await Room.find().populate('createdBy', 'name email');
        res.json({ success: true, rooms });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error.");
    }
});

// Route to handle room join requests
router.post('/join/:roomId', fetchuser, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    try {
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found." });
        }

        if (room.invitedUsers.includes(userId)) {
            return res.status(400).json({ success: false, error: "You are already a member of this room." });
        }

        // Add user to the room
        room.invitedUsers.push(userId);
        await room.save();

        res.json({ success: true, room });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error.");
    }
});

export default router;
