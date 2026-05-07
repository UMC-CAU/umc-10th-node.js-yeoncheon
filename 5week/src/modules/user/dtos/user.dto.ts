// 요청 DTO
export interface UserSignUpRequest {
  email: string;
  name: string;
  gender: string;
  birth: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  password: string;
  preferences: number[];
}

// 응답 DTO
export const responseFromUser = (data: { user:any, preferences: any[] }) => {
  const preferCategory = data.preferences.map((p) => p.foodCategory.name);

  return {
    email: data.user.email,
    name: data.user.name,
    preferCategory: preferCategory,
  };
};

// 내가 작성한 리뷰 목록 응답 DTO
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
) => {
  const data = reviews.map((review) => ({
    id: review.id,
    storeId: review.store_id,
    storeName: review.store.name,
    content: review.content,
    rating: review.rating,
    createdAt: review.created_at,
  }));

  const nextCursor =
    reviews.length > 0 ? reviews[reviews.length - 1]!.id : null;

  return {
    data,
    pagination: { cursor: nextCursor },
  };
};

// 내가 진행 중인 미션 목록 응답 DTO
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
) => {
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
    store: {
      id: um.mission.store.id,
      name: um.mission.store.name,
    },
  }));

  const lastUserMission = userMissions[userMissions.length - 1];
  const nextCursor = lastUserMission ? lastUserMission.id : null;

  return {
    data,
    pagination: { cursor: nextCursor },
  };
};

// 미션 완료 처리 응답 DTO
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
}) => {
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