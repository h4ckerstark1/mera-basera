import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);

export default router;
