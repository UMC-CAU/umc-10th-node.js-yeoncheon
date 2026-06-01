export interface MissionAddRequest {
  /** 미션을 등록할 가게 ID */
  storeId: number;
  /** 미션 이름 */
  name: string;
  /** 미션 상세 설명 */
  description: string;
  /** 미션 보상 포인트 */
  reward: number;
  /** 미션 마감일 (YYYY-MM-DD) */
  deadline: string;
}

export interface MissionChallengeRequest {
  /** 도전할 유저 ID */
  userId: number;
  /** 도전할 미션 ID */
  missionId: number;
}

export interface MissionCreateBody {
  /** 미션 이름 */
  name: string;
  /** 미션 상세 설명 */
  description: string;
  /** 미션 보상 포인트 */
  reward: number;
  /** 미션 마감일 (YYYY-MM-DD) */
  deadline: string;
}

export interface MissionCreateResponse {
  id: number;
  storeId: number;
  name: string;
}

export interface MissionChallengeResponse {
  id: number;
  userId: number;
  missionId: number;
  status: string;
}
