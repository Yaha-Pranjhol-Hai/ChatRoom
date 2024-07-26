import mongoose from "mongoose";
import User from './user.model.js';

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},
{ timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);

export default Room;