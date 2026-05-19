/**
 * [7주차 리팩토링]
 * - 옛 응답 포맷 → success() 봉투
 * - catch 안에서 응답 만들지 않음 → next(err) 위임
 *
 * [파일명 오타]
 * mission.conroller.ts (오타) — route 파일이 이미 이 이름을 import 하고 있고
 * TSOA glob에도 안 잡혀서 surgical change 원칙으로 유지.
 */
import {
  Body,
  Controller,
  Path,
  Post,
  Route,
  Tags,
} from "tsoa";

import {
  createMission,
  challengeMission,
} from "../services/mission.service.js";

import { MissionAddRequest } from "../dtos/mission.dtos.js";

import { ApiResponse, success } from "../../../common/responses/response.js";

@Route("")
@Tags("Missions")
export class MissionController extends Controller {
  @Post("stores/{storeId}/missions")
  public async handleAddMission(
    @Path() storeId: number,
    @Body()
    body: {
      name: string;
      description: string;
      reward: number;
      deadline: string;
    },
  ): Promise<ApiResponse<any>> {
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

  @Post("missions/{missionId}/challenge")
  public async handleChallengeMission(
    @Path() missionId: number,
  ): Promise<ApiResponse<any>> {
    const userId = 2;

    const result = await challengeMission(userId, missionId);

    return success(result);
  }
}