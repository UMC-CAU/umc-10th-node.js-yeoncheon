import { prisma } from "../../../config/db.config.js";
import { CreateReviewDto } from "../dtos/store.review.dto.js";

// 특정 가게의 리뷰 목록 (cursor 기반)
export const getAllStoreReviews = async (storeId: number, cursor: number) => {
  const reviews = await prisma.store_review.findMany({
    where: {
      store_id: storeId,
      id: { gt: cursor },
    },
    orderBy: { id: "asc" },
    take: 5,
    include: { user: true, store: true },
  });
  return reviews;
};

// 리뷰 생성
export const createReview = async (
  storeId: number,
  userId: number,
  data: CreateReviewDto,
) => {
  const review = await prisma.store_review.create({
    data: {
      store_id: storeId,
      user_id: userId,
      content: data.content,
      rating: data.rating,
    },
  });
  return review;
};

// 가게 추가
export const addStore = async (data: {
  region_id: number;
  name: string;
  address: string;
}) => {
  const created = await prisma.store.create({
    data: {
      region_id: data.region_id,
      name: data.name,
      address: data.address,
    },
  });
  return created.id;
};

// 가게 단건 조회
export const getStoreById = async (storeId: number) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, name: true },
  });
  return store;
};

// 특정 가게의 미션 목록 (cursor 기반)
export const getMissionsByStoreId = async (
  storeId: number,
  cursor: number
) => {
  const missions = await prisma.mission.findMany({
    where: {
      store_id: storeId,
      id: { gt: cursor },
    },
    orderBy: { id: "asc" },
    take: 5,
  });
  return missions;
};
