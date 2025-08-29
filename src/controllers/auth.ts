import { Request, Response } from "express";
import User from "../models/user.js";

export const getLogin = (req: Request, res: Response) => {
  const isLoggedIn = req.get("cookie")?.split(";")[1].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

export const postLogin = (req: Request, res: Response) => {
  User.findById("5bab316ce0a7c75f783cb8a8")
    .then((user) => {
      if (user) {
        req.session.user = user;
        req.session.isLoggedIn = true;
        req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      }
    })
    .catch((err) => console.log(err));
};

export const postLogout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    res.redirect("/");
    console.log(err);
  });
};
