import bcrypt from "bcryptjs";
import { UserSignUpRequest } from "../dtos/user.dto";
import { addUser, getUserByEmail, setPreference } from "../repositories/user.repository";
import { getReviewsByUserId } from "../repositories/user.repository.js";
import { responseFromMyReviews } from "../dtos/user.dto.js";
import { getOngoingMissionsByUserId } from "../repositories/user.repository.js";
import { responseFromMyMissions } from "../dtos/user.dto.js";

export const userSignUp = async (body: UserSignUpRequest) => {
  // 이메일 중복 확인
  const existingUser = await getUserByEmail(body.email);
  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(body.password, 10);

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

  // 선호 카테고리 저장
  for (const preferenceId of body.preferences ?? []) {
    await setPreference(userId, preferenceId);
  }

  return { id: userId, email: body.email, name: body.name };
};

export const listMyReviews = async (userId: number, cursor: number) => {
  const reviews = await getReviewsByUserId(userId, cursor);
  return responseFromMyReviews(reviews);
};

export const listMyOngoingMissions = async (userId: number, cursor: number) => {
  const userMissions = await getOngoingMissionsByUserId(userId, cursor);
  return responseFromMyMissions(userMissions);
};

import {
  getUserMissionById,
  completeUserMission,
} from "../repositories/user.repository.js";
import { responseFromCompletedMission } from "../dtos/user.dto.js";

export const completeMyMission = async (
  userId: number,
  userMissionId: number
) => {
  // 1. 존재 확인
  const userMission = await getUserMissionById(userMissionId);
  if (!userMission) {
    throw new Error("존재하지 않는 미션 도전 기록입니다.");
  }

  // 2. 본인 것인지 확인
  if (userMission.user_id !== userId) {
    throw new Error("본인의 미션이 아닙니다.");
  }

  // 3. 현재 진행 중 상태인지 확인
  if (userMission.status !== "도전중") {
    throw new Error("진행 중인 미션이 아닙니다.");
  }

  // 4. 완료 처리
  const updated = await completeUserMission(userMissionId);
  return responseFromCompletedMission(updated);
};