// 가게 추가 요청 DTO
export interface StoreAddRequest {
  /** 가게가 속한 지역 ID */
  regionId: number;
  /** 가게 이름 */
  name: string;
  /** 가게 주소 */
  address: string;
}

// 가게 추가 응답 DTO
export interface StoreAddResponse {
  id: number;
  region_id: number;
  name: string;
  address: string;
}

export interface StoreReviewItem {
  id: number;
  store_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: Date | null;
}

export interface StoreMissionItem {
  id: number;
  storeId: number;
  name: string;
  description: string | null;
  reward: number;
  deadline: Date | null;
}

export interface PaginatedStoreResponse<T> {
  data: T[];
  pagination: {
    cursor: number | null;
  };
}

export const bodyToStore = (body: StoreAddRequest) => {
  return {
    region_id: body.regionId,
    name: body.name,
    address: body.address,
  };
};

// 가게 리뷰 목록 응답 DTO
export const responseFromReviews = (
  reviews: StoreReviewItem[],
): PaginatedStoreResponse<StoreReviewItem> => {
  const last = reviews[reviews.length - 1];

  return {
    data: reviews,
    pagination: {
      cursor: last ? last.id : null,
    },
  };
};

// 특정 가게의 미션 목록 응답 DTO
export const responseFromStoreMissions = (
  missions: {
    id: number;
    store_id: number;
    name: string;
    description: string | null;
    reward: number;
    deadline: Date | null;
  }[]
): PaginatedStoreResponse<StoreMissionItem> => {
  const data = missions.map((m) => ({
    id: m.id,
    storeId: m.store_id,
    name: m.name,
    description: m.description,
    reward: m.reward,
    deadline: m.deadline,
  }));

  const nextCursor = missions[missions.length - 1]?.id ?? null;

  return {
    data,
    pagination: { cursor: nextCursor },
  };
};
