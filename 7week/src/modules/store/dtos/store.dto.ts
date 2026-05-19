// 가게 추가 요청 DTO
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

// 가게 리뷰 목록 응답 DTO
export const responseFromReviews = (reviews: any[]) => {
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
) => {
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