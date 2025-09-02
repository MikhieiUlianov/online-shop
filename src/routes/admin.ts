import express from "express";
import { body } from "express-validator";

import {
  getEditProduct,
  getAddProduct,
  getProducts,
  postAddProduct,
  deleteProduct,
  postEditProduct,
} from "../controllers/admin.js";
import { isAuth } from "../middleware/is-auth.js";

const router = express.Router();

// /admin/add-product => GET
router.get(
  "/add-product",
  [
    body("title").isString().trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 5, max: 200 }),
    body("price").isFloat(),
  ],
  isAuth,
  getAddProduct
);

// /admin/products => GET
router.get("/products", isAuth, getProducts);

// /admin/add-product => POST
router.post("/add-product", isAuth, postAddProduct);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isString().trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 5, max: 200 }),
    body("price").isFloat(),
  ],
  isAuth,
  postEditProduct
);

router.delete("/product/:productId", isAuth, deleteProduct);

export default router;
