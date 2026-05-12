export interface MissionAddRequest {
  storeId: number;
  name: string;
  description: string;
  reward: number;
  deadline: string;
}

export interface MissionChallengeRequest {
  userId: number;
  missionId: number;
}