
import mongoose from "mongoose";
import fetchuser from "../middleware/fetchuser.js";
import { Router } from "express";
import User from "../models/user.model.js";
import Room from '../models/room.model.js';
import Message from "../models/message.model.js";

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
        // By specifying '_id', you're only retrieving the user IDs and not the entire user documents.
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

router.get('/userrooms', fetchuser, async (req,res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({success: false, error: 'User not Found'});
        }

        const rooms = await Room.find({
            $or: [{ createdBy: userId}, { invitedUsers: userId}]
        });

        res.json({ success: true, rooms});
    } catch (error) {
        console.error('Error fetching rooms: ', error.message);
        res.status(500).send('Internal server error.')
    }
})

// Route to handle room join requests
router.post('/join/:roomId', fetchuser, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ success: false, error: "Invalid room ID." });
    }

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found." });
        }

        if (room.invitedUsers.includes(req.user.email)) {
            return res.status(400).json({ success: false, error: "You are already a member of this room." });
        }

        // Add user to the room
        room.invitedUsers.push(req.user.email);
        await room.save();

        // io.to(roomId).emit('userJoined', { userId });

        //Logging the join event.
        const initialMessage = new Message({
            user: userId,
            message: "Joined the room",
            room: room._id
        });
        await initialMessage.save();


        res.json({ success: true, room });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error.");
    }
});


export default router;
