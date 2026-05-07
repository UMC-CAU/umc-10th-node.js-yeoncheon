import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createStore,
  listStoreReviews,
  createReviewService,
  listStoreMissions,
} from "../services/store.service.js";
import { StoreAddRequest } from "../dtos/store.dto.js";

// 가게 추가
export const handleAddStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await createStore(req.body as StoreAddRequest);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "가게 추가 성공",
      data: store,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: "E5000",
      message: "서버 내부 오류가 발생했습니다.",
      data: null,
    });
  }
};

// 가게 리뷰 목록 조회
export const handleListStoreReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = Number(req.params["storeId"]) || 0;
    const rawCursor = req.query["cursor"];
    const cursor =
      typeof rawCursor === "string" ? parseInt(rawCursor, 10) : 0;
    const result = await listStoreReviews(storeId, cursor);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 리뷰 생성
export const handleCreateReview = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const storeId = Number(req.params["storeId"]);
    if (isNaN(storeId)) {
      res.status(400).json({
        success: false,
        message: "올바른 storeId가 아닙니다.",
      });
      return;
    }
    const review = await createReviewService(storeId, req.body);
    res.status(201).json({
      success: true,
      code: "S201",
      message: "리뷰 생성 성공",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// 가게 미션 목록 조회
export const handleListStoreMissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = Number(req.params["storeId"]);
    if (isNaN(storeId)) {
      res.status(400).json({
        success: false,
        message: "올바른 storeId가 아닙니다.",
      });
      return;
    }
    const rawCursor = req.query["cursor"];
    const cursor =
      typeof rawCursor === "string" ? parseInt(rawCursor, 10) : 0;
    const result = await listStoreMissions(storeId, cursor);
    res.status(200).json({
      success: true,
      code: "S200",
      message: "가게 미션 목록 조회 성공",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};