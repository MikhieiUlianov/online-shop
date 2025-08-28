import { UserType } from "./models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
