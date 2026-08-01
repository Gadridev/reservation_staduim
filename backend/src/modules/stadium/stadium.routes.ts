import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  createStadiumSchema,
  updateStadiumSchema,
  updateWorkingHoursSchema,
} from "./stadium.validation.js";

import {
  createStadium,
  getPublicStadiums,
  getStadiumById,
  getMyStadiums,
  updateStadium,
  deactivateStadium,
  updateWorkingHours,
  getWorkingHours,
} from "./stadium.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createStadiumSchema),
  createStadium,
);
router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createStadiumSchema),
  createStadium,
);
router.get("/", getPublicStadiums);
router.get("/my", authenticate, authorize("OWNER"), getMyStadiums);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("OWNER"),
  deactivateStadium,
);
router.patch(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(updateStadiumSchema),
  updateStadium,
);
router.get("/:id/working-hours", getWorkingHours);
router.patch(
  "/:id/working-hours",
  authenticate,
  authorize("OWNER"),
  validate(updateWorkingHoursSchema),
  updateWorkingHours,
);

router.get("/:id", getStadiumById);

export default router;
