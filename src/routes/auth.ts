import express from "express";
import {
  getLogin,
  postLogin,
  postLogout,
  postSignup,
  getSignup,
  getReset,
  postReset,
  getNewPassword,
} from "../controllers/auth.js";

const router = express.Router();

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/signup", getSignup);
router.post("/signup", postSignup);
router.post("/logout", postLogout);
router.get("/reset", getReset);
router.post("/reset", postReset);
router.post("/reset/:token", getNewPassword);
export default router;
