import { Router } from "express";
import {
  analytics,
  checkAlias,
  create,
  list,
  remove,
  update,
} from "../controllers/urlController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  aliasQuerySchema,
  analyticsQuerySchema,
  createUrlSchema,
  updateUrlSchema,
} from "../validation/schemas.js";

const router = Router();

router.use(requireAuth);
router.get("/check-alias", validate(aliasQuerySchema, "query"), asyncHandler(checkAlias));
router.post("/", validate(createUrlSchema), asyncHandler(create));
router.get("/", asyncHandler(list));
router.get("/:id/analytics", validate(analyticsQuerySchema, "query"), asyncHandler(analytics));
router.patch("/:id", validate(updateUrlSchema), asyncHandler(update));
router.delete("/:id", asyncHandler(remove));

export default router;
