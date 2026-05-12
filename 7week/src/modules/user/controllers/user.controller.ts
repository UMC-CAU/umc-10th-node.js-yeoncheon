/**
 * [7주차 - 응답 통일 + 미들웨어]
 * JSON 응답: success() 봉투
 * HTML 응답(미들웨어 학습용 5개): req.res!.send() 직접 사용 (봉투 X)
 */

import {
  Body,
  Controller,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Query,
  Request,
  Route,
  Tags,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import {
  UserSignUpRequest,
  UserSignUpResponse,
  PaginatedResponse,
  MyReviewItem,
  MyMissionItem,
  CompletedMissionResponse,
} from "../dtos/user.dto.js";
import {
  userSignUp,
  listMyReviews,
  listMyOngoingMissions,
  completeMyMission,
} from "../services/user.service.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { ApiResponse, success } from "../../../common/responses/response.js";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  // ===== JSON 응답 (봉투 적용) =====

  @Post("signup")
  public async handleUserSignUp(
    @Body() body: UserSignUpRequest,
  ): Promise<ApiResponse<UserSignUpResponse>> {
    const user = await userSignUp(body);
    return success(user);
  }

  @Get("{userId}/reviews")
  public async handleListMyReviews(
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyReviewItem>>> {
    const result = await listMyReviews(userId, cursor ?? 0);
    return success(result);
  }

  @Get("{userId}/missions")
  public async handleListMyOngoingMissions(
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyMissionItem>>> {
    const result = await listMyOngoingMissions(userId, cursor ?? 0);
    return success(result);
  }

  @Patch("{userId}/missions/{userMissionId}/complete")
  public async handleCompleteMyMission(
    @Path() userId: number,
    @Path() userMissionId: number,
  ): Promise<ApiResponse<CompletedMissionResponse>> {
    const result = await completeMyMission(userId, userMissionId);
    return success(result);
  }

  // ===== HTML 응답 (미들웨어 학습용, 봉투 적용 X) =====

  @Get("guest")
  public async handleGuestPage(
    @Request() req: ExpressRequest,
  ): Promise<void> {
    req.res!
      .status(200)
      .type("text/html")
      .send(`
        <h1>게스트 페이지</h1>
        <p>이 페이지는 로그인이 필요 없습니다.</p>
        <ul>
          <li><a href="/api/v1/users/mypage">마이페이지 (로그인 필요)</a></li>
        </ul>
      `);
  }

  @Get("login")
  public async handleLoginPage(
    @Request() req: ExpressRequest,
  ): Promise<void> {
    req.res!
      .status(200)
      .type("text/html")
      .send(`
        <h1>로그인 페이지</h1>
        <p>로그인이 필요한 페이지에서 튕겨나오면 여기로 옵니다.</p>
        <p><a href="/api/v1/users/set-login">로그인 하기</a></p>
      `);
  }

  @Get("mypage")
  @Middlewares(authorizeUser())
  public async handleMypage(@Request() req: ExpressRequest): Promise<void> {
    req.res!
      .status(200)
      .type("text/html")
      .send(`
        <h1>마이페이지</h1>
        <p>환영합니다, ${req.cookies.username}님!</p>
        <p>이 페이지는 로그인한 사람만 볼 수 있습니다.</p>
      `);
  }

  @Get("set-login")
  public async handleSetLogin(
    @Request() req: ExpressRequest,
  ): Promise<void> {
    req.res!.cookie("username", "UMC10th", { maxAge: 3600000 });
    req.res!
      .status(200)
      .type("text/html")
      .send(`
        <p>로그인 쿠키(username=UMC10th) 생성 완료!</p>
        <p><a href="/api/v1/users/mypage">마이페이지로 이동</a></p>
      `);
  }

  @Get("set-logout")
  public async handleSetLogout(
    @Request() req: ExpressRequest,
  ): Promise<void> {
    req.res!.clearCookie("username");
    req.res!
      .status(200)
      .type("text/html")
      .send(`
        <p>로그아웃 완료 (쿠키 삭제).</p>
        <p><a href="/api/v1/users/guest">메인으로</a></p>
      `);
  }
}
