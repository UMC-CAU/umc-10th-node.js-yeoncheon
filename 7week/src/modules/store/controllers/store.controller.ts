/**
 * [7주차 리팩토링]
 * - 옛 응답 포맷 {success, code, message, data} → 봉투 패턴
 * - catch 블록에서 응답 직접 만들지 않음. next(err)로 전역 에러 미들웨어에 위임
 */
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
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
  responseFromReviews,
  responseFromStoreMissions,
} from "../dtos/store.dto.js";

import {
  CreateReviewDto,
  toReviewResponseDto,
} from "../dtos/store.review.dto.js";

import { ApiResponse, success } from "../../../common/responses/response.js";

@Route("stores")
@Tags("Stores")
export class StoreController extends Controller {
  @Post("/")
  public async handleAddStore(
    @Body() body: StoreAddRequest,
  ): Promise<ApiResponse<any>> {
    const store = await createStore(body);
    return success(store);
  }

  @Get("{storeId}/reviews")
  public async handleListStoreReviews(
    @Path() storeId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<any>> {
    const result = await listStoreReviews(storeId, cursor ?? 0);
    return success(result);
  }

  @Post("{storeId}/reviews")
  public async handleCreateReview(
    @Path() storeId: number,
    @Body() body: CreateReviewDto,
  ): Promise<ApiResponse<any>> {
    const review = await createReviewService(storeId, body);
    return success(review);
  }

  @Get("{storeId}/missions")
  public async handleListStoreMissions(
    @Path() storeId: number,
    @Query() cursor?: number,
  ): Promise<ApiResponse<any>> {
    const result = await listStoreMissions(storeId, cursor ?? 0);
    return success(result);
  }
}