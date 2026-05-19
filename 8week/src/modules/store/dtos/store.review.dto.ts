export interface CreateReviewDto {
  /** 리뷰를 작성하는 유저 ID */
  user_id: number;
  /** 리뷰 내용 */
  content: string;
  /** 평점. 0 이상 5 이하만 허용됩니다. */
  rating: number;
}

export interface CreateReviewResponse {
  id: number;
  storeId: number;
  userId: number;
  content: string;
  rating: number;
  createdAt: Date | null;
}

export const toReviewResponseDto = (review: {
  id: number;
  store_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: Date | null;
}): CreateReviewResponse => {
  return {
    id: review.id,
    storeId: review.store_id,
    userId: review.user_id,
    content: review.content,
    rating: review.rating,
    createdAt: review.created_at,
  };
};
