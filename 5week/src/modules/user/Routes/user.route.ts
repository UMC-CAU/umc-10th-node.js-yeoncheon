import { Router } from "express";
import { handleListMyReviews, handleUserSignUp } from "../controllers/user.controllers";
import { handleListMyOngoingMissions } from "../controllers/user.controllers.js";
import { handleCompleteMyMission } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post("/signup", handleUserSignUp);
userRouter.get("/:userId/reviews", handleListMyReviews);
userRouter.get("/:userId/missions", handleListMyOngoingMissions);
userRouter.patch(
  "/:userId/missions/:userMissionId/complete",
  handleCompleteMyMission
);

export default userRouter;