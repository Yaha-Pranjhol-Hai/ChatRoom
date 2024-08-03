import express from "express";
import fetchuser from "../middleware/fetchuser.js";

const router = express.Router();

router.get('/validateToken', fetchuser, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
    })

export default router;