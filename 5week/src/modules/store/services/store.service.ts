export const createStore = async (body: StoreAddRequest) => {
  const storeData = bodyToStore(body);
  const storeId = await addStore(storeData);
  return { id: storeId, ...storeData };
};

import { bodyToStore, bodyToReview, StoreAddRequest, ReviewAddRequest } from "../dtos/store.dto";
import { addStore, addReview, getStoreById } from "../repositories/store.repository";

// 기존 createStore는 그대로 두고 아래 추가
export const createReview = async (body: ReviewAddRequest) => {
  // 가게 존재 여부 검증
  const store = await getStoreById(body.storeId);
  if (!store) {
    throw new Error("존재하지 않는 가게입니다.");
  }

  const reviewData = bodyToReview(body);
  const reviewId = await addReview(reviewData);
  return { id: reviewId, ...reviewData };
};