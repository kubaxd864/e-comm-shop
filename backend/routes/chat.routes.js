import { Router } from "express";
import { getRooms, getMessages } from "../controllers/chat.controller.js";
import { requireAuth } from "../functions/auth.functions.js";

const router = Router();

router.get("/get_rooms", requireAuth, getRooms);
router.get("/messages/:roomId", requireAuth, getMessages);

export default router;
