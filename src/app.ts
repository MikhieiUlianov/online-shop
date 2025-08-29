import path from "path";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Mongoose } from "mongoose";

import get404 from "./controllers/error.js";
import User, { UserType } from "./models/user.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";

const app = express();

const MONGODB_URI =
  "mongodb+srv://username:password@cluster0.mongodb.net/mydatabase";

const MongoStore = MongoDBStore(session);
const store = new MongoStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

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

app.use((req: Request, res: Response, next: NextFunction) => {
  User.findById("5bab316ce0a7c75f783cb8a8")
    .then((user: UserType | null) => {
      if (user) {
        req.user = user;
        next();
      }
    })
    .catch((err: unknown) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(get404);

mongoose
  .connect(MONGODB_URI)
  .then((result: Mongoose) => {
    User.findOne().then((user: UserType | null) => {
      if (!user) {
        const user = new User({
          name: "Max",
          email: "max@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err: unknown) => {
    console.log(err);
  });
