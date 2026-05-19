/**
 * [7주차 리팩토링]
 * - 명시적 Promise<...> 반환 타입
 * - 일반 Error → 도메인별 커스텀 에러 (DuplicateUserEmail/UserMissionNotFound 등)
 */

import bcryptjs from "bcryptjs";
import {
  UserSignUpRequest,
  UserSignUpResponse,
  PaginatedResponse,
  MyReviewItem,
  MyMissionItem,
  CompletedMissionResponse,
  responseFromMyReviews,
  responseFromMyMissions,
  responseFromCompletedMission,
} from "../dtos/user.dto.js";
import {
  addUser,
  getUserByEmail,
  setPreference,
  getReviewsByUserId,
  getOngoingMissionsByUserId,
  getUserMissionById,
  completeUserMission,
} from "../repositories/user.repository.js";
import {
  DuplicateUserEmailError,
  UserMissionNotFoundError,
  MissionForbiddenError,
  MissionStateError,
} from "../../../common/errors/error.js";

export const userSignUp = async (
  body: UserSignUpRequest,
): Promise<UserSignUpResponse> => {
  // 이메일 중복 → 409 + U001
  const existingUser = await getUserByEmail(body.email);
  if (existingUser) {
    throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", body);
  }

  const hashedPassword = await bcryptjs.hash(body.password, 10);

  const userId = await addUser({
    email: body.email,
    name: body.name,
    gender: body.gender,
    birth: body.birth,
    address: body.address,
    detailAddress: body.detailAddress,
    phoneNumber: body.phoneNumber,
    password: hashedPassword,
  });

  for (const preferenceId of body.preferences ?? []) {
    await setPreference(userId, preferenceId);
  }

  return { id: userId, email: body.email, name: body.name };
};

export const listMyReviews = async (
  userId: number,
  cursor: number,
): Promise<PaginatedResponse<MyReviewItem>> => {
  const reviews = await getReviewsByUserId(userId, cursor);
  return responseFromMyReviews(reviews);
};

export const listMyOngoingMissions = async (
  userId: number,
  cursor: number,
): Promise<PaginatedResponse<MyMissionItem>> => {
  const userMissions = await getOngoingMissionsByUserId(userId, cursor);
  return responseFromMyMissions(userMissions);
};

export const completeMyMission = async (
  userId: number,
  userMissionId: number,
): Promise<CompletedMissionResponse> => {
  // 도전 기록 존재 여부 → 404 + M002
  const userMission = await getUserMissionById(userMissionId);
  if (!userMission) {
    throw new UserMissionNotFoundError("존재하지 않는 미션 도전 기록입니다.", {
      userMissionId,
    });
  }

  // 본인 미션인지 → 403 + M003
  if (userMission.user_id !== userId) {
    throw new MissionForbiddenError("본인의 미션이 아닙니다.", {
      userId,
      ownerId: userMission.user_id,
    });
  }

  // 도전중 상태인지 → 400 + M004
  if (userMission.status !== "도전중") {
    throw new MissionStateError("진행 중인 미션이 아닙니다.", {
      currentStatus: userMission.status,
    });
  }

  const updated = await completeUserMission(userMissionId);
  return responseFromCompletedMission(updated);
};
