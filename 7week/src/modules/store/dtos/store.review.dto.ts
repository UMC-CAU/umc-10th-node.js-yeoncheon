export interface CreateReviewDto {
  user_id: number;
  content: string;
  rating: number;
}

export const toReviewResponseDto = (review: {
  id: number;
  store_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: Date | null;
}) => {
  return {
    id: review.id,
    storeId: review.store_id,
    userId: review.user_id,
    content: review.content,
    rating: review.rating,
    createdAt: review.created_at,
  };
};
