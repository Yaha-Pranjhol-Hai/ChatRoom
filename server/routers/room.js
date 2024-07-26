import fetchuser from "../middleware/fetchuser.js";
import Room from '../models/room.model.js';
import { Router } from "express";


const router = Router();

// Route to send a message to a specific room.
router.post('/send', fetchuser, async (req, res) => {
    try {
        const { message, room } = req.body;
        const roomExists = await Room.findById(room);


        if(!roomExists || !roomExists.invitedUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, error: "You are not invited to this room."})
        }

        const newMessage = new Message({
            user: req.user.id,
            message,
            room
        });

        const savedMessage = await newMessage.save();
        res.json({ success: true, message: savedMessage});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error.");
    }
})

// Route to fetch messages of a specific room
router.get('/room/:roomId', fetchuser, async (req,res) => {
    try {
        const { roomId } = req.params;
        const roomExists = await Room.findById(roomId);

        if(!roomExists || !roomExists.invitedUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, error: "You are not invited to this room."})
        }

        const messages = await Message.find({ room: roomId }).populate('user', 'name email');
        res.json({ success: true, messages });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
})

export default router;
