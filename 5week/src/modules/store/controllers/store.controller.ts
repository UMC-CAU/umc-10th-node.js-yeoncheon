import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createStore, createReview } from "../services/store.service";
import { StoreAddRequest, ReviewAddRequest } from "../dtos/store.dto";

export const handleAddStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("가게 추가를 요청했습니다!");
    console.log("body:", req.body);

    const store = await createStore(req.body as StoreAddRequest);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "가게 추가 성공",
      data: store,
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: "E5000",
      message: "서버 내부 오류가 발생했습니다.",
      data: null,
    });
  }
};

export const handleAddReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("리뷰 추가를 요청했습니다!");
    const storeId = parseInt(req.params.storeId as string);
    const body: ReviewAddRequest = {
      storeId,
      userId: 2,  // 특정 사용자로 가정
      content: req.body.content,
      rating: req.body.rating,
    };

    const review = await createReview(body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "리뷰 추가 성공",
      data: review,
    });
  } catch (err) {
    console.log("Error:", err);
    if ((err as Error).message === "존재하지 않는 가게입니다.") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        code: "E4040",
        message: "존재하지 않는 가게입니다.",
        data: null,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        code: "E5000",
        message: "서버 내부 오류가 발생했습니다.",
        data: null,
      });
    }
  }
};