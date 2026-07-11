import health from "./health.js";
import registrations from "./registrations.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);

export default router;
