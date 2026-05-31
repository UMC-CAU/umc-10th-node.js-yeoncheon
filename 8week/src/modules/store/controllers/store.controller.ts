import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

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

@Route("stores")
@Tags("Stores")
export class StoreController extends Controller {
  /**
   * 가게 추가 API
   * @summary 새로운 가게를 등록합니다.
   * @param body 등록할 가게의 지역, 이름, 주소 정보
   */
  @Post("/")
  @SuccessResponse(200, "가게 추가 성공")
  public async handleAddStore(
    @Body() body: StoreAddRequest,
  ): Promise<ApiResponse<StoreAddResponse>> {
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
   * @param body 리뷰 작성자 ID, 내용, 평점 정보
   */
  @Post("{storeId}/reviews")
  @SuccessResponse(200, "리뷰 작성 성공")
  @Response<ApiErrorResponse>(400, "리뷰 평점 또는 내용 검증 실패")
  public async handleCreateReview(
    @Path() storeId: number,
    @Body() body: CreateReviewDto,
  ): Promise<ApiResponse<CreateReviewResponse>> {
    const review = await createReviewService(storeId, body);
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
