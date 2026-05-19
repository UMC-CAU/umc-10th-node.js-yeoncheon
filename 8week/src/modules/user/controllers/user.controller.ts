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
  Response,
  Route,
  SuccessResponse,
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
import {
  ApiErrorResponse,
  ApiResponse,
  success,
} from "../../../common/responses/response.js";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  // ===== JSON 응답 (봉투 적용) =====

  /**
   * 회원가입 API
   * @summary 회원가입을 처리하는 엔드포인트입니다.
   * @param body 회원가입에 필요한 유저 정보와 선호 카테고리 ID 목록
   */
  @Post("signup")
  @SuccessResponse(200, "회원가입 성공")
  @Response<ApiErrorResponse>(409, "중복된 이메일 에러")
  public async handleUserSignUp(
    @Body() body: UserSignUpRequest,
  ): Promise<ApiResponse<UserSignUpResponse>> {
    const user = await userSignUp(body);
    return success(user);
  }

  /**
   * 내가 작성한 리뷰 목록 조회 API
   * @summary 특정 유저가 작성한 리뷰 목록을 커서 기반으로 조회합니다.
   * @param userId 리뷰를 조회할 유저 ID
   * @param cursor 마지막으로 조회한 리뷰 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{userId}/reviews")
  @SuccessResponse(200, "내 리뷰 목록 조회 성공")
  public async handleListMyReviews(
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyReviewItem>>> {
    const result = await listMyReviews(userId, cursor ?? 0);
    return success(result);
  }

  /**
   * 내가 진행 중인 미션 목록 조회 API
   * @summary 특정 유저가 도전 중인 미션 목록을 커서 기반으로 조회합니다.
   * @param userId 미션 목록을 조회할 유저 ID
   * @param cursor 마지막으로 조회한 유저 미션 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{userId}/missions")
  @SuccessResponse(200, "내 진행 중 미션 목록 조회 성공")
  public async handleListMyOngoingMissions(
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyMissionItem>>> {
    const result = await listMyOngoingMissions(userId, cursor ?? 0);
    return success(result);
  }

  /**
   * 진행 중인 미션 완료 API
   * @summary 특정 유저가 도전 중인 미션을 완료 상태로 변경합니다.
   * @param userId 미션을 완료할 유저 ID
   * @param userMissionId 완료 처리할 유저 미션 ID
   */
  @Patch("{userId}/missions/{userMissionId}/complete")
  @SuccessResponse(200, "미션 완료 성공")
  @Response<ApiErrorResponse>(400, "진행 중인 미션이 아닌 경우")
  @Response<ApiErrorResponse>(403, "본인의 미션이 아닌 경우")
  @Response<ApiErrorResponse>(404, "존재하지 않는 미션 도전 기록")
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
