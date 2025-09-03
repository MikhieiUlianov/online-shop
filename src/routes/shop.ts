import express from "express";

import {
  getIndex,
  getProduct,
  getProducts,
  getCart,
  postCart,
  postCartDeleteProduct,
  getOrders,
  getInvoice,
  getCheckout,
  getCheckoutSuccess,
} from "../controllers/shop.js";
import { isAuth } from "../middleware/is-auth.js";

const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/cart", isAuth, getCart);

router.post("/cart", isAuth, postCart);

router.post("/cart-delete-item", isAuth, postCartDeleteProduct);

router.get("/checkout", isAuth, getCheckout);

router.get("/checkout/success", isAuth, getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, getCheckout);

router.get("/orders", isAuth, getOrders);

router.get("/orders/:orderId", isAuth, getInvoice);

export default router;
