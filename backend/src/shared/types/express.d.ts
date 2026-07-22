import type { IUser } from "../../modules/auth/auth.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};  