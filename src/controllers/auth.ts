import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import User, {
  UserType,
} from "../../../online-shop — копия/src/models/user.js";
import { sendTestEmail } from "../mailer.js";

export const getLogin = (req: Request, res: Response) => {
  const errors: string[] = req.flash("error");
  const message: string | null = errors.length > 0 ? errors[0] : null;

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

export const getSignup = (req: Request, res: Response) => {
  const errors: string[] = req.flash("error");
  const message: string | null = errors.length > 0 ? errors[0] : null;

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: "Invalid email or password.",
        oldInput: { email, password },
        validationErrors: [],
      });
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
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: "Invalid email or password.",
      oldInput: { email, password },
      validationErrors: [],
    });
  } catch (error: unknown) {
    console.log(error);
    res.redirect("/500");
  }
};

export const postSignup = (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);

  if (!errors.isEmpty) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
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
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
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

export const postReset = (req: Request, res: Response, next: NextFunction) => {
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
      .catch((err: unknown) => {
        const error: Error & { httpStatusCode?: number } = new Error(
          "Something went wrong."
        );
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

export const getNewPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        passwordToken: token,
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const postNewPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const newPassowrd = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser: UserType | null = null;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassowrd, 12);
    })
    .then((hashedPass) => {
      if (resetUser) {
        resetUser.password = hashedPass;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      }
    })
    .then(() => res.redirect("/"))
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};
