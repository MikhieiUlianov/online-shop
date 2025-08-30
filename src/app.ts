import path from "path";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Mongoose } from "mongoose";
import csurf from "csurf";
import flash from "connect-flash";

import get404 from "./controllers/error.js";
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

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req: Request, res: Response, next: NextFunction) => {
  User.findById(req.session.user?._id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      }
    })
    .catch((err) => console.log(err));
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(get404);

mongoose
  .connect(MONGODB_URI)
  .then((result: Mongoose) => {
    app.listen(3000);
  })
  .catch((err: unknown) => {
    console.log(err);
  });
