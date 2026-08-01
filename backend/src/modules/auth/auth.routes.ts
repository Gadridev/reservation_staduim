import { Router } from "express";
import {  login, register } from "./auth.controller.js";

import { loginSchema, registerSchema } from "./auth.validation.js";
import { validate } from "../../shared/middleware/validate.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";

const router = Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);


router.get("/owner-only", authenticate, authorize("OWNER"), (req, res) => {
  res.json({ success: true, data: { message: "Welcome, owner!" } });
});


export default router;
