export interface StoreAddRequest {
  regionId: number;
  name: string;
  address: string;
}

export const bodyToStore = (body: StoreAddRequest) => {
  return {
    region_id: body.regionId,
    name: body.name,
    address: body.address,
  };
};

export interface ReviewAddRequest {
  storeId: number;
  userId: number;
  content: string;
  rating: number;
}

export const bodyToReview = (body: ReviewAddRequest) => {
  return {
    store_id: body.storeId,
    user_id: body.userId,
    content: body.content,
    rating: body.rating,
  };
};