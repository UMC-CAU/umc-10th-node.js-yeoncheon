import {
  Body,
  Controller,
  Get,
  Middlewares,
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
  createStore,
  listStoreReviews,
  createReviewService,
  listStoreMissions,
} from "../services/store.service.js";

import {
  StoreAddRequest,
  StoreAddResponse,
  StoreMissionItem,
  StoreReviewItem,
  PaginatedStoreResponse,
} from "../dtos/store.dto.js";

import {
  CreateReviewDto,
  CreateReviewResponse,
} from "../dtos/store.review.dto.js";

import {
  ApiErrorResponse,
  ApiResponse,
  success,
} from "../../../common/responses/response.js";
import {
  authenticateJwt,
  getAuthenticatedUser,
} from "../../../common/middlewares/jwt-auth.middleware.js";

@Route("stores")
@Tags("Stores")
export class StoreController extends Controller {
  /**
   * 가게 추가 API
   * @summary 새로운 가게를 등록합니다.
   * @param body 등록할 가게의 지역, 이름, 주소 정보
   */
  @Post("/")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "가게 추가 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  public async handleAddStore(
    @Body() body: StoreAddRequest,
  ): Promise<ApiResponse<StoreAddResponse>> {
    // 가게 등록은 로그인 사용자만 가능하도록 JWT 인증을 적용한다.
    const store = await createStore(body);
    return success(store);
  }

  /**
   * 가게 리뷰 목록 조회 API
   * @summary 특정 가게에 작성된 리뷰 목록을 커서 기반으로 조회합니다.
   * @param storeId 리뷰를 조회할 가게 ID
   * @param cursor 마지막으로 조회한 리뷰 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{storeId}/reviews")
  @SuccessResponse(200, "가게 리뷰 목록 조회 성공")
  public async handleListStoreReviews(
    @Path() storeId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedStoreResponse<StoreReviewItem>>> {
    const result = await listStoreReviews(storeId, cursor ?? 0);
    return success(result);
  }

  /**
   * 리뷰 작성 API
   * @summary 특정 가게에 리뷰를 작성합니다.
   * @param storeId 리뷰를 작성할 가게 ID
   * @param req JWT 검증 후 req.user에 로그인 사용자 정보가 들어옵니다.
   * @param body 리뷰 내용과 평점 정보
   */
  @Post("{storeId}/reviews")
  @Middlewares(authenticateJwt)
  @SuccessResponse(200, "리뷰 작성 성공")
  @Response<ApiErrorResponse>(401, "인증되지 않은 요청")
  @Response<ApiErrorResponse>(400, "리뷰 평점 또는 내용 검증 실패")
  public async handleCreateReview(
    @Request() req: ExpressRequest,
    @Path() storeId: number,
    @Body() body: CreateReviewDto,
  ): Promise<ApiResponse<CreateReviewResponse>> {
    // 리뷰 작성자 ID는 클라이언트가 보내는 값이 아니라 JWT에서 꺼낸다.
    const loginUser = getAuthenticatedUser(req);
    const review = await createReviewService(storeId, loginUser.id, body);
    return success(review);
  }

  /**
   * 가게 미션 목록 조회 API
   * @summary 특정 가게에 등록된 미션 목록을 커서 기반으로 조회합니다.
   * @param storeId 미션 목록을 조회할 가게 ID
   * @param cursor 마지막으로 조회한 미션 ID. 첫 조회 시 생략하거나 0을 전달합니다.
   */
  @Get("{storeId}/missions")
  @SuccessResponse(200, "가게 미션 목록 조회 성공")
  public async handleListStoreMissions(
    @Path() storeId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<PaginatedStoreResponse<StoreMissionItem>>> {
    const result = await listStoreMissions(storeId, cursor ?? 0);
    return success(result);
  }
}
