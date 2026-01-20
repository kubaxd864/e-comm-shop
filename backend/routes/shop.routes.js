import { Router } from "express";
import { getStores, contact } from "../controllers/shop.controller.js";

const router = Router();

router.get("/get_stores", getStores);
router.post("/contact", contact);

export default router;
