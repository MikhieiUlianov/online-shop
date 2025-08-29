import { Request, Response } from "express";

export const getLogin = (req: Request, res: Response) => {
  const isLoggedIn = req.get("cookie")?.split(";")[1].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

export const postLogin = (req: Request, res: Response) => {
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};
