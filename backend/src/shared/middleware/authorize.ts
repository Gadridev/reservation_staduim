import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../../modules/auth/auth.model.js";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(req.user.role)
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    
    next();
  };
}