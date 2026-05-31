import {
  Body,
  Controller,
  Middlewares,
  Path,
  Post,
  Request,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { Request as ExpressRequest } from "express";

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
import {
  authenticateJwt,
  getAuthenticatedUser,
} from "../../../common/middlewares/jwt-auth.middleware.js";

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
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "미션 추가 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(404, "존재하지 않는 가게")
  public async handleAddMission(
    @Path() storeId: number,
    @Body() body: MissionCreateBody,
  ): Promise<ApiResponse<MissionCreateResponse>> {
    // 미션 등록은 로그인 사용자만 가능하도록 JWT 인증을 적용한다.
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
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "미션 도전 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(409, "이미 도전 중인 미션")
  public async handleChallengeMission(
    @Request() req: ExpressRequest,
    @Path() missionId: number,
  ): Promise<ApiResponse<MissionChallengeResponse>> {
    // 기존에는 userId = 2로 고정되어 있었지만, 이제 JWT의 로그인 사용자 ID를 사용한다.
    const loginUser = getAuthenticatedUser(req);

    const result = await challengeMission(loginUser.id, missionId);

    return success(result);
  }
}
