import express from "express";
import { check, body } from "express-validator";

import User from "../models/user.js";

import {
  getLogin,
  postLogin,
  postLogout,
  postSignup,
  getSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} from "../controllers/auth.js";

const router = express.Router();

router.get("/login", getLogin);
router.post(
  "/login",
  [
    body("password", "Please enter valid password.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(),
  ],
  postLogin
);
router.get("/signup", getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          return Promise.reject(
            "E-mail exists already, please pick a different one."
          );
        });
      })
      .normalizeEmail(),
    body(
      "passowrd",
      "Please enter a valid password with only number and text ant at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error("Password have to match!");
        return true;
      }),
  ],
  postSignup
);
router.post("/logout", postLogout);
router.get("/reset", getReset);
router.post("/reset", postReset);
router.get("/reset/:token", getNewPassword);
router.post("/new-password", postNewPassword);
export default router;
