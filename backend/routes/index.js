import { Router } from "express";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chat.routes.js";
import cartRoutes from "./cart.routes.js";
import adminRoutes from "./admin.routes.js";
import shopRoutes from "./shop.routes.js";
import clientRoutes from "./client.routes.js";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/cart", cartRoutes);
router.use("/admin", adminRoutes);
router.use("/", shopRoutes);
router.use("/", clientRoutes);
router.use("/", productRoutes);
router.use("/", orderRoutes);

export default router;
