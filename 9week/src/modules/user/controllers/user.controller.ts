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
  UserProfileUpdateRequest,
  UserProfileUpdateResponse,
  PaginatedResponse,
  MyReviewItem,
  MyMissionItem,
  CompletedMissionResponse,
} from "../dtos/user.dto.js";
import {
  userSignUp,
  updateMyProfile,
  listMyReviews,
  listMyOngoingMissions,
  completeMyMission,
} from "../services/user.service.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import {
  authenticateJwt,
  getAuthenticatedUser,
} from "../../../common/middlewares/jwt-auth.middleware.js";
import { UserForbiddenError } from "../../../common/errors/error.js";
import {
  ApiErrorResponse,
  ApiResponse,
  success,
} from "../../../common/responses/response.js";

const assertSelfUser = (pathUserId: number, tokenUserId: number) => {
  if (pathUserId !== tokenUserId) {
    throw new UserForbiddenError("본인의 정보만 조회하거나 수정할 수 있습니다.", {
      pathUserId,
      tokenUserId,
    });
  }
};

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
   * 내 프로필 수정 API
   * @summary JWT로 로그인한 사용자가 Google 로그인 후 부족한 전화번호, 생일 등의 정보를 채웁니다.
   * @param req JWT 검증 후 req.user에 로그인 사용자 정보가 들어옵니다.
   * @param body 수정할 내 프로필 정보
   */
  @Patch("me")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "내 프로필 수정 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(404, "존재하지 않는 사용자")
  public async handleUpdateMyProfile(
    @Request() req: ExpressRequest,
    @Body() body: UserProfileUpdateRequest,
  ): Promise<ApiResponse<UserProfileUpdateResponse>> {
    // JWT 미들웨어가 검증한 사용자 ID를 사용하므로 클라이언트가 userId를 조작할 수 없다.
    const loginUser = getAuthenticatedUser(req);
    const result = await updateMyProfile(loginUser.id, body);
    return success(result);
  }

  /**
   * 내가 작성한 리뷰 목록 조회 API
   * @summary 특정 유저가 작성한 리뷰 목록을 커서 기반으로 조회합니다.
   * @param userId 리뷰를 조회할 유저 ID
   * @param cursor 마지막으로 조회한 리뷰 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{userId}/reviews")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "내 리뷰 목록 조회 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(403, "다른 사용자의 리뷰 목록 조회 시도")
  public async handleListMyReviews(
    @Request() req: ExpressRequest,
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyReviewItem>>> {
    // path의 userId가 아니라 JWT의 사용자와 같은지 먼저 확인한다.
    const loginUser = getAuthenticatedUser(req);
    assertSelfUser(userId, loginUser.id);

    const result = await listMyReviews(loginUser.id, cursor ?? 0);
    return success(result);
  }

  /**
   * 내가 진행 중인 미션 목록 조회 API
   * @summary 특정 유저가 도전 중인 미션 목록을 커서 기반으로 조회합니다.
   * @param userId 미션 목록을 조회할 유저 ID
   * @param cursor 마지막으로 조회한 유저 미션 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{userId}/missions")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "내 진행 중 미션 목록 조회 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(403, "다른 사용자의 미션 목록 조회 시도")
  public async handleListMyOngoingMissions(
    @Request() req: ExpressRequest,
    @Path() userId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedResponse<MyMissionItem>>> {
    // 내 미션 목록 API이므로 토큰 사용자와 path userId가 일치해야 한다.
    const loginUser = getAuthenticatedUser(req);
    assertSelfUser(userId, loginUser.id);

    const result = await listMyOngoingMissions(loginUser.id, cursor ?? 0);
    return success(result);
  }

  /**
   * 진행 중인 미션 완료 API
   * @summary 특정 유저가 도전 중인 미션을 완료 상태로 변경합니다.
   * @param userId 미션을 완료할 유저 ID
   * @param userMissionId 완료 처리할 유저 미션 ID
   */
  @Patch("{userId}/missions/{userMissionId}/complete")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "미션 완료 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(400, "진행 중인 미션이 아닌 경우")
  @Response<ApiErrorResponse>(403, "본인의 미션이 아닌 경우")
  @Response<ApiErrorResponse>(404, "존재하지 않는 미션 도전 기록")
  public async handleCompleteMyMission(
    @Request() req: ExpressRequest,
    @Path() userId: number,
    @Path() userMissionId: number,
  ): Promise<ApiResponse<CompletedMissionResponse>> {
    // path userId를 그대로 믿지 않고 JWT의 로그인 사용자와 일치하는지 검증한다.
    const loginUser = getAuthenticatedUser(req);
    assertSelfUser(userId, loginUser.id);

    const result = await completeMyMission(loginUser.id, userMissionId);
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
