import path from "path";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Mongoose } from "mongoose";
import csurf from "csurf";
import flash from "connect-flash";
import multer, { FileFilterCallback } from "multer";

import { get404, get500 } from "./controllers/error.js";
import User from "./models/user.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";

const MONGODB_URI =
  "mongodb+srv://username:password@cluster0.mongodb.net/mydatabase";

const app = express();
const MongoStore = MongoDBStore(session);
const store = new MongoStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csurf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFiter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    return cb(null, true);
  }
  return cb(null, false);
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFiter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
//creates secret and session of not exists
app.use(csrfProtection);
app.use(flash());

app.use((req: Request, res: Response, next: NextFunction) => {
  User.findById(req.session.user?._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  //generates a fresh token derived from that secret.
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", get500);
app.use(get404);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.redirect("/500");
});

mongoose
  .connect(MONGODB_URI)
  .then((result: Mongoose) => {
    app.listen(3000);
  })
  .catch((err: unknown) => {
    console.log(err);
  });
