import express from "express";

import {
  getEditProduct,
  getAddProduct,
  getProducts,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} from "../controllers/admin.js";
import { isAuth } from "../middleware/is-auth.js";

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, getProducts);

// /admin/add-product => POST
router.post("/add-product", isAuth, postAddProduct);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post("/edit-product", isAuth, postEditProduct);

router.post("/delete-product", isAuth, postDeleteProduct);

export default router;
