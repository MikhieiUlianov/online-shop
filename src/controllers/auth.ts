import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import User from "../models/user.js";
import { sendTestEmail } from "../mailer.js";

export const getLogin = (req: Request, res: Response) => {
  const errors: string[] = req.flash("error");
  const message: string | null = errors.length > 0 ? errors[0] : null;

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

export const getSignup = (req: Request, res: Response) => {
  const errors: string[] = req.flash("error");
  const message: string | null = errors.length > 0 ? errors[0] : null;

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

export const postLogin = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
      /*   throw new Error("User not found"); */
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
    req.flash("error", "Invalid email or password.");
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
        req.flash("error", "User exists.");
        res.redirect("/login");
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
      return sendTestEmail(
        email,
        "Signup Successfully!",
        "Account has been created successfully!"
      );
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

export const getReset = (req: Request, res: Response) => {
  const errors: string[] = req.flash("error");
  const message: string | null = errors.length > 0 ? errors[0] : null;

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Teset Password",
    errorMessage: message,
  });
};

export const postReset = (req: Request, res: Response) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return Promise.reject("No user");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((user) => {
        if (user) {
          res.redirect("/");
          return sendTestEmail(
            req.body.email,
            "Password reset Successfully!",
            ` <p>You requested a password reset</p>
           '<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>'`
          );
        }
      })
      .catch((err) => console.log(err));
  });
};

export const getNewPassword = (req: Request, res: Response) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      const errors: string[] = req.flash("error");
      const message: string | null = errors.length > 0 ? errors[0] : null;
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user?._id.toString(),
      });
    })
    .catch((err) => console.log(err));
};
