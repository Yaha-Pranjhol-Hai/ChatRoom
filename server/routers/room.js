import express from "express";
import fetchuser from "../middleware/fetchuser";
import Room from '../models/room.model';
import { Router } from "express";


const router = Router();

// Create a Room
router.post('/createroom', fetchuser, async (req,res) => {
    try {
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})