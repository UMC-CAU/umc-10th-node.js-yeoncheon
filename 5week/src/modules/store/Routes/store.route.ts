import { Router } from "express";
import { handleAddStore, handleListStoreReviews, handleCreateReview } from "../controllers/store.controller.js";
import { handleListStoreMissions } from "../controllers/store.controller.js";

const storeRouter = Router();

storeRouter.post("/", handleAddStore);
storeRouter.post("/:storeId/reviews", handleCreateReview);
storeRouter.get("/:storeId/reviews", handleListStoreReviews);
storeRouter.get("/:storeId/missions", handleListStoreMissions);

export default storeRouter;
