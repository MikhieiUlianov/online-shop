import { Request, Response } from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const getLogin = (req: Request, res: Response) => {
  const isLoggedIn = req.get("cookie")?.split(";")[1].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

export const getSignup = (req: Request, res: Response) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

export const postLogin = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("User not found");
    }

    const matchedPass = await bcrypt.compare(password, user.password);

    if (matchedPass) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    }
    return res.redirect("/login");
  } catch (error: unknown) {
    console.log(error);
    res.redirect("/signup");
  }
};

export const postSignup = (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        throw new Error("User exists");
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const user = new User({
        email,
        hashedPassword,
        cart: { items: [] },
      });

      return user.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/signup");
    });
};

export const postLogout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    res.redirect("/");
    console.log(err);
  });
};
