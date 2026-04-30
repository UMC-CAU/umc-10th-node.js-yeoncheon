import { addMission, getUserMission, addUserMission } from "../repositories/mission.repository";
import { getStoreById } from "../../store/repositories/store.repository";

export const createMission = async (body: any) => {
  const store = await getStoreById(body.storeId);
  if (!store) {
    throw new Error("존재하지 않는 가게입니다.");
  }

  const missionId = await addMission({
    store_id: body.storeId,
    name: body.name,
    description: body.description,
    reward: body.reward,
    deadline: body.deadline,
  });

  return { id: missionId, storeId: body.storeId, name: body.name };
};

export const challengeMission = async (userId: number, missionId: number) => {
  const existing = await getUserMission(userId, missionId);
  if (existing) {
    throw new Error("이미 도전 중인 미션입니다.");
  }

  const userMissionId = await addUserMission(userId, missionId);
  return { id: userMissionId, userId, missionId, status: "도전중" };
};