import { Router } from "express";
import {
  getCart,
  addToCart,
  lowerQuantity,
  removeFromCart,
  updateDelivery,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../functions/auth.functions.js";

const router = Router();

router.get("/data", requireAuth, getCart);
router.post("/delivery", requireAuth, updateDelivery);
router.post("/lowerquantity/:productId", requireAuth, lowerQuantity);
router.post("/:productId", requireAuth, addToCart);
router.delete("/:productId", requireAuth, removeFromCart);

export default router;
