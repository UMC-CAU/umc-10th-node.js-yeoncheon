import { Router } from "express";
import { handleAddStore, handleAddReview } from "../controllers/store.controller";

const storeRouter = Router();

storeRouter.post("/", handleAddStore);
storeRouter.post("/:storeId/reviews", handleAddReview);

export default storeRouter;