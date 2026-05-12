// ============ 요청 DTO ============
export interface UserSignUpRequest {
  email: string;
  name: string;
  gender: string;        // "남성" | "여성"
  birth: string;         // ISO 날짜 문자열
  address: string;
  detailAddress: string;
  phoneNumber: string;
  password: string;
  preferences: number[];
}

// ============ 응답 DTO ============
export interface UserSignUpResponse {
  id: number;
  email: string;
  name: string;
}

export interface MyReviewItem {
  id: number;
  storeId: number;
  storeName: string;
  content: string;
  rating: number;
  createdAt: Date | null;
}

export interface MyMissionItem {
  userMissionId: number;
  status: string | null;
  startedAt: Date | null;
  mission: {
    id: number;
    name: string;
    description: string | null;
    reward: number;
    deadline: Date | null;
  };
  store: { id: number; name: string };
}

export interface CompletedMissionResponse {
  userMissionId: number;
  status: string | null;
  completedMission: { id: number; name: string; reward: number };
  store: { id: number; name: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { cursor: number | null };
}

// ============ Prisma → 응답 DTO 변환 함수 ============

export const responseFromMyReviews = (
  reviews: {
    id: number;
    store_id: number;
    user_id: number;
    content: string;
    rating: number;
    created_at: Date | null;
    store: { id: number; name: string };
  }[]
): PaginatedResponse<MyReviewItem> => {
  const data = reviews.map((review) => ({
    id: review.id,
    storeId: review.store_id,
    storeName: review.store.name,
    content: review.content,
    rating: review.rating,
    createdAt: review.created_at,
  }));
  const nextCursor = reviews.length > 0 ? reviews[reviews.length - 1]!.id : null;
  return { data, pagination: { cursor: nextCursor } };
};

export const responseFromMyMissions = (
  userMissions: {
    id: number;
    user_id: number;
    mission_id: number;
    status: string | null;
    created_at: Date | null;
    mission: {
      id: number;
      name: string;
      description: string | null;
      reward: number;
      deadline: Date | null;
      store: { id: number; name: string };
    };
  }[]
): PaginatedResponse<MyMissionItem> => {
  const data = userMissions.map((um) => ({
    userMissionId: um.id,
    status: um.status,
    startedAt: um.created_at,
    mission: {
      id: um.mission.id,
      name: um.mission.name,
      description: um.mission.description,
      reward: um.mission.reward,
      deadline: um.mission.deadline,
    },
    store: { id: um.mission.store.id, name: um.mission.store.name },
  }));
  const lastUserMission = userMissions[userMissions.length - 1];
  const nextCursor = lastUserMission ? lastUserMission.id : null;
  return { data, pagination: { cursor: nextCursor } };
};

export const responseFromCompletedMission = (userMission: {
  id: number;
  user_id: number;
  mission_id: number;
  status: string | null;
  created_at: Date | null;
  mission: {
    id: number;
    name: string;
    reward: number;
    store: { id: number; name: string };
  };
}): CompletedMissionResponse => {
  return {
    userMissionId: userMission.id,
    status: userMission.status,
    completedMission: {
      id: userMission.mission.id,
      name: userMission.mission.name,
      reward: userMission.mission.reward,
    },
    store: {
      id: userMission.mission.store.id,
      name: userMission.mission.store.name,
    },
  };
};
