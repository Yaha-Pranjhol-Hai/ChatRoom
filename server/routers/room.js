import fetchuser from "../middleware/fetchuser.js";
import Room from '../models/room.model.js';
import { Router } from "express";
import User from "../models/user.model.js";

const router = Router();

// Create a Room
router.post('/createroom', fetchuser, async (req, res) => {
    console.log('Request received');
    try {
        const { name, invitedEmails } = req.body;
        // console.log('Request body:', req.body);

        if (!name || !Array.isArray(invitedEmails) || invitedEmails.length === 0) {
            // console.log('Invalid data');
            return res.status(400).json({ success: false, error: 'Invalid data' });
        }

        // Find users by their email addresses
        const invitedUsers = await User.find({ email: { $in: invitedEmails } }, '_id');
        const invitedUserIds = invitedUsers.map(user => user._id);
        // console.log('Invited Users:', invitedUserIds);

        let room = await Room.findOne({ name });
        // console.log('Room found:', room);

        if (room) {
            invitedUserIds.forEach(userId => {
                if (!room.invitedUsers.includes(userId)) {
                    room.invitedUsers.push(userId);
                }
            });
            room = await room.save();
        } else {
            room = new Room({ name, createdBy: req.user.id, invitedUsers: invitedUserIds });
            room = await room.save();
        }
        res.json({ success: true, room });
    } catch (error) {
        console.error('Error creating room:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to fetch rooms where the user is invited.
router.get('/', fetchuser, async (req, res) => {
    try {
        const rooms = await Room.find({ invitedEmails: req.user.id }).populate('createdBy', 'name email');
        res.json({ success: true, rooms });

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
// Remember to change it in the Route invitedEmails to invitedEmails.
router.post('/join/:roomId', fetchuser, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found." });
        }

        if (room.invitedEmails.includes(userId)) {
            return res.status(400).json({ success: false, error: "You are already a member of this room." });
        }

        // Add user to the room
        room.invitedEmails.push(userId);
        await room.save();

        res.json({ success: true, room });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error.");
    }
});


export default router;
