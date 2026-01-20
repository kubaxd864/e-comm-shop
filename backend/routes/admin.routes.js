import { Router } from "express";
import {
  getAdminData,
  addProduct,
  getAdminProducts,
  deleteProduct,
  updateProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUserStatus,
  updatePrivilages,
  addCategory,
  updateCategoryStatus,
} from "../controllers/admin.controller.js";
import { upload } from "../config/multer.js";
import { requireAdmin, requireOwner } from "../functions/auth.functions.js";

const router = Router();

router.get("/data", requireAdmin, getAdminData);
router.post("/add_product", requireAdmin, upload.array("images"), addProduct);
router.get("/get_products", requireAdmin, getAdminProducts);
router.put("/delete_product/:id", requireAdmin, deleteProduct);
router.put(
  "/update_product/:id",
  requireAdmin,
  upload.array("images"),
  updateProduct,
);
router.get("/orders", requireAdmin, getOrders);
router.put("/update_order_status", requireAdmin, updateOrderStatus);
router.get("/users", requireAdmin, getUsers);
router.put("/update_user_status", requireAdmin, updateUserStatus);
router.put("/update_privilages", requireOwner, updatePrivilages);
router.post("/add_category", requireAdmin, addCategory);
router.put("/update_category_status", requireAdmin, updateCategoryStatus);

export default router;
