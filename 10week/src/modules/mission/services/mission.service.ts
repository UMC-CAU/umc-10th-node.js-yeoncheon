/**
 * [7주차 리팩토링]
 * - 일반 Error → 커스텀 AppError 서브클래스 (errorCode/statusCode 포함)
 * - 전역 에러 미들웨어가 자동으로 FAIL 봉투로 변환해줌
 */

import { addMission, getUserMission, addUserMission } from "../repositories/mission.repository.js";
import { getStoreById } from "../../store/repositories/store.repository.js";
import { MissionAddRequest } from "../dtos/mission.dtos.js";
import {
  StoreNotFoundError,
  AlreadyChallengingMissionError,
} from "../../../common/errors/error.js";

export const createMission = async (body: MissionAddRequest) => {
  // 가게 존재 확인. 없으면 404 + S001
  const store = await getStoreById(body.storeId);
  if (!store) {
    throw new StoreNotFoundError("존재하지 않는 가게입니다.", { storeId: body.storeId });
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
  // 이미 도전 중이면 409 + M001
  const existing = await getUserMission(userId, missionId);
  if (existing) {
    throw new AlreadyChallengingMissionError("이미 도전 중인 미션입니다.", {
      userId,
      missionId,
    });
  }

  const userMissionId = await addUserMission(userId, missionId);
  return { id: userMissionId, userId, missionId, status: "도전중" };
};
