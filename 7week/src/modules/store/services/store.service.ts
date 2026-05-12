/**
 * [7주차 리팩토링]
 * - 일반 Error → InvalidReviewError (400 + S002)
 * - data로 실제 잘못된 값을 함께 넘김 (프론트 디버깅 편의)
 */
import { bodyToStore, StoreAddRequest, responseFromReviews, responseFromStoreMissions } from "../dtos/store.dto.js";
import {
  addStore,
  getAllStoreReviews,
  createReview,
  getMissionsByStoreId,
} from "../repositories/store.repository.js";
import { CreateReviewDto, toReviewResponseDto } from "../dtos/store.review.dto.js";
import { InvalidReviewError } from "../../../common/errors/error.js";

export const createStore = async (body: StoreAddRequest) => {
  const storeData = bodyToStore(body);
  const storeId = await addStore(storeData);
  return { id: storeId, ...storeData };
};

export const listStoreReviews = async (storeId: number, cursor: number) => {
  const reviews = await getAllStoreReviews(storeId, cursor);
  return responseFromReviews(reviews);
};

export const createReviewService = async (
  storeId: number,
  data: CreateReviewDto,
) => {
  if (data.rating < 0 || data.rating > 5) {
    throw new InvalidReviewError("평점은 0~5 사이여야 합니다.", { rating: data.rating });
  }
  if (!data.content || data.content.trim().length === 0) {
    throw new InvalidReviewError("리뷰 내용을 입력해주세요.", { content: data.content });
  }
  const review = await createReview(storeId, data);
  return toReviewResponseDto(review);
};

export const listStoreMissions = async (storeId: number, cursor: number) => {
  const missions = await getMissionsByStoreId(storeId, cursor);
  return responseFromStoreMissions(missions);
};
