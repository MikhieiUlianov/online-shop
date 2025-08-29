import express from "express";

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

export default router;
