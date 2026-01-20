import { Router } from "express";
import {
  makeOrder,
  getStripeConfig,
  createPaymentIntent,
} from "../controllers/order.controller.js";
import { requireAuth } from "../functions/auth.functions.js";

const router = Router();

router.post("/make_order", requireAuth, makeOrder);
router.get("/stripe/config", requireAuth, getStripeConfig);
router.post("/stripe/create-payment-intent", requireAuth, createPaymentIntent);

export default router;
