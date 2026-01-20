import { Router } from "express";
import {
  getProducts,
  getProductData,
  getSimilarProducts,
  getFiltered,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/products", getFiltered);
router.get("/get_products", getProducts);
router.get("/get_product/data/:id", getProductData);
router.get("/get_simular_products", getSimilarProducts);

export default router;
