import {
  Body,
  Controller,
  Path,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

import {
  createMission,
  challengeMission,
} from "../services/mission.service.js";

import {
  MissionAddRequest,
  MissionChallengeResponse,
  MissionCreateBody,
  MissionCreateResponse,
} from "../dtos/mission.dtos.js";

import {
  ApiErrorResponse,
  ApiResponse,
  success,
} from "../../../common/responses/response.js";

@Route("")
@Tags("Missions")
export class MissionController extends Controller {
  /**
   * 가게 미션 추가 API
   * @summary 특정 가게에 새로운 미션을 등록합니다.
   * @param storeId 미션을 등록할 가게 ID
   * @param body 미션 이름, 설명, 보상, 마감일 정보
   */
  @Post("stores/{storeId}/missions")
  @SuccessResponse(200, "미션 추가 성공")
  @Response<ApiErrorResponse>(404, "존재하지 않는 가게")
  public async handleAddMission(
    @Path() storeId: number,
    @Body() body: MissionCreateBody,
  ): Promise<ApiResponse<MissionCreateResponse>> {
    const missionBody: MissionAddRequest = {
      storeId,
      name: body.name,
      description: body.description,
      reward: body.reward,
      deadline: body.deadline,
    };

    const mission = await createMission(missionBody);

    return success(mission);
  }

  /**
   * 미션 도전 API
   * @summary 로그인 유저가 특정 미션에 도전합니다.
   * @param missionId 도전할 미션 ID
   */
  @Post("missions/{missionId}/challenge")
  @SuccessResponse(200, "미션 도전 성공")
  @Response<ApiErrorResponse>(409, "이미 도전 중인 미션")
  public async handleChallengeMission(
    @Path() missionId: number,
  ): Promise<ApiResponse<MissionChallengeResponse>> {
    const userId = 2;

    const result = await challengeMission(userId, missionId);

    return success(result);
  }
}
