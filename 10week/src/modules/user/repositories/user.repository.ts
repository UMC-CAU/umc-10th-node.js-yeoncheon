import { prisma } from "../../../config/db.config.js";
import { user_gender } from "../../../generated/prisma/enums.js";

const genderMap: Record<string, user_gender> = {
  "남성": user_gender.MALE,
  "여성": user_gender.FEMALE,
}; 

const toUserGender = (gender: string): user_gender => {
  const mappedGender = genderMap[gender];
  if (!mappedGender) {
    throw new Error("성별은 '남성' 또는 '여성'만 사용할 수 있습니다.");
  }

  return mappedGender;
};

// 1. 유저 생성 (기존 addUser)
export const addUser = async (data: {
  email: string;
  name: string;
  gender: string;
  birth: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  password: string;
}) => {
  const created = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      gender: toUserGender(data.gender),
      birth: new Date(data.birth),
      address: data.address,
      detailAddress: data.detailAddress,   
      phoneNumber: data.phoneNumber,       
      password: data.password,
    },
  });

  return created.id;
};

// 2. 이메일로 유저 조회 (기존 getUserByEmail)
export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  return user;
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
};

// Google 로그인으로 먼저 생성된 사용자도 나중에 자기 정보를 채울 수 있도록 업데이트
export const updateUserProfile = async (
  userId: number,
  data: {
    name?: string;
    gender?: string;
    birth?: string;
    address?: string;
    detailAddress?: string;
    phoneNumber?: string;
    password?: string;
  },
) => {
  const updateData: {
    name?: string;
    gender?: user_gender;
    birth?: Date;
    address?: string;
    detailAddress?: string;
    phoneNumber?: string;
    password?: string;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.gender !== undefined) updateData.gender = toUserGender(data.gender);
  if (data.birth !== undefined) updateData.birth = new Date(data.birth);
  if (data.address !== undefined) updateData.address = data.address;
  if (data.detailAddress !== undefined) updateData.detailAddress = data.detailAddress;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
  if (data.password !== undefined) updateData.password = data.password;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return user;
};

export const deletePreferencesByUserId = async (userId: number) => {
  await prisma.user_favor_category.deleteMany({
    where: { user_id: userId },
  });
};

// 3. 선호 카테고리 추가 (기존 setPreference)
export const setPreference = async (userId: number, foodCategoryId: number) => {
  const result = await prisma.user_favor_category.create({
    data: {
      user_id: userId,
      food_category_id: foodCategoryId,
    },
  });

  return result.id;
};

export const getReviewsByUserId = async (userId: number, cursor: number) => {
  const reviews = await prisma.store_review.findMany({
    where: {
      user_id: userId,
      id: { gt: cursor },
    },
    orderBy: { id: "asc" },
    take: 5,
    include: { store: true },
  });
  return reviews;
};

// 내가 진행 중인 미션 목록 조회
export const getOngoingMissionsByUserId = async (
  userId: number,
  cursor: number
) => {
  const userMissions = await prisma.user_mission.findMany({
    where: {
      user_id: userId,
      status: "도전중",
      id: { gt: cursor },
    },
    orderBy: { id: "asc" },
    take: 5,
    include: {
      mission: {
        include: {
          store: true,
        },
      },
    },
  });
  return userMissions;
};

// user_mission 단건 조회 (검증용)
export const getUserMissionById = async (userMissionId: number) => {
  const userMission = await prisma.user_mission.findUnique({
    where: { id: userMissionId },
  });
  return userMission;
};

// 미션 완료 처리 (status 업데이트)
export const completeUserMission = async (userMissionId: number) => {
  const updated = await prisma.user_mission.update({
    where: { id: userMissionId },
    data: { status: "완료" },
    include: {
      mission: {
        include: { store: true },
      },
    },
  });
  return updated;
};
