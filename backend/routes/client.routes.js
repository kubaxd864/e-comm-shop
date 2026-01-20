import { Router } from "express";
import {
  me,
  userUpdate,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
  getMyOrders,
} from "../controllers/client.controller.js";
import { requireAuth } from "../functions/auth.functions.js";

const router = Router();

router.get("/me", me);
router.put("/user_update", requireAuth, userUpdate);
router.put("/change_password", requireAuth, changePassword);
router.get("/favorites", requireAuth, getFavorites);
router.post("/favorites/:productId", requireAuth, addFavorite);
router.delete("/favorites/:productId", requireAuth, removeFavorite);
router.get("/my_orders", requireAuth, getMyOrders);

export default router;
