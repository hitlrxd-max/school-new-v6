import { Router } from "express";
import health from "./health.js";
import registrations from "./registrations.js";

const router = Router();

router.use(health);
router.use(registrations);

export default router;
