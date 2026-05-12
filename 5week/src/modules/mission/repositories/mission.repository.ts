import { prisma } from "../../../config/db.config.js";

// 가게에 미션 추가
export const addMission = async (data: {
  store_id: number;
  name: string;
  description: string;
  reward: number;
  deadline: string;
}) => {
  const created = await prisma.mission.create({
    data: {
      store_id: data.store_id,
      name: data.name,
      description: data.description,
      reward: data.reward,
      deadline: new Date(data.deadline),
    },
  });
  return created.id;
};

// 유저가 해당 미션을 이미 도전 중인지 조회
export const getUserMission = async (userId: number, missionId: number) => {
  const userMission = await prisma.user_mission.findFirst({
    where: {
      user_id: userId,
      mission_id: missionId,
      status: "도전중",
    },
    select: { id: true },
  });
  return userMission;
};

// 유저가 미션 도전 시작
export const addUserMission = async (userId: number, missionId: number) => {
  const created = await prisma.user_mission.create({
    data: {
      user_id: userId,
      mission_id: missionId,
    },
  });
  return created.id;
};