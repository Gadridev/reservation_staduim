import { Router } from "express";
import { register } from "./auth.controller.js";

import { registerSchema } from "./auth.validation.js";
import { validate } from "../../shared/middleware/validate.js";

const router = Router();
router.post("/register", validate(registerSchema), register);

export default router;
