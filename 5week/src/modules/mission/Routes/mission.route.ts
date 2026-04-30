import { Router } from "express";
import { handleAddMission, handleChallengeMission } from "../controllers/mission.conroller";

const missionRouter = Router();

missionRouter.post("/stores/:storeId/missions", handleAddMission);
missionRouter.post("/missions/:missionId/challenge", handleChallengeMission);

export default missionRouter;