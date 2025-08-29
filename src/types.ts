import { UserType } from "./models/user.js";
import "express-session";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
      isLoggedIn: boolean;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    isLoggedIn?: boolean;
  }
}
