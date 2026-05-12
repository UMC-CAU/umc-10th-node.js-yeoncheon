import { bodyToStore, StoreAddRequest, responseFromReviews, responseFromStoreMissions } from "../dtos/store.dto.js";
import {
  addStore,
  getAllStoreReviews,
  createReview,
  getMissionsByStoreId,
} from "../repositories/store.repository.js";
import { CreateReviewDto, toReviewResponseDto } from "../dtos/store.review.dto.js";

// 가게 생성
export const createStore = async (body: StoreAddRequest) => {
  const storeData = bodyToStore(body);
  const storeId = await addStore(storeData);
  return { id: storeId, ...storeData };
};

// 특정 가게의 리뷰 목록
export const listStoreReviews = async (storeId: number, cursor: number) => {
  const reviews = await getAllStoreReviews(storeId, cursor);
  return responseFromReviews(reviews);
};

// 리뷰 생성
export const createReviewService = async (
  storeId: number,
  data: CreateReviewDto
) => {
  if (data.rating < 0 || data.rating > 5) {
    throw new Error("평점은 0~5 사이여야 합니다.");
  }
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("리뷰 내용을 입력해주세요.");
  }
  const review = await createReview(storeId, data);
  return toReviewResponseDto(review);
};

// 특정 가게의 미션 목록
export const listStoreMissions = async (storeId: number, cursor: number) => {
  const missions = await getMissionsByStoreId(storeId, cursor);
  return responseFromStoreMissions(missions);
};