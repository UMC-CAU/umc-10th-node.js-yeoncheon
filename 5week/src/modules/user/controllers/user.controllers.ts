import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userSignUp } from "../services/user.service";
import { UserSignUpRequest } from "../dtos/user.dto";
import { listMyReviews } from "../services/user.service.js";
import { listMyOngoingMissions } from "../services/user.service.js";

export const handleUserSignUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    const user = await userSignUp(req.body as UserSignUpRequest);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "회원가입 성공",
      data: user,
    });
  } catch (err) {
    console.log("Error:", err);
    if ((err as Error).message === "이미 존재하는 이메일입니다.") {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        code: "E4090",
        message: "이미 존재하는 이메일입니다.",
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

export const handleListMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params["userId"]);
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "올바른 userId가 아닙니다.",
      });
      return;
    }

    const rawCursor = req.query["cursor"];
    const cursor =
      typeof rawCursor === "string" ? parseInt(rawCursor, 10) : 0;

    const result = await listMyReviews(userId, cursor);
    res.status(200).json({
      success: true,
      code: "S200",
      message: "내 리뷰 목록 조회 성공",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const handleListMyOngoingMissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params["userId"]);
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "올바른 userId가 아닙니다.",
      });
      return;
    }

    const rawCursor = req.query["cursor"];
    const cursor =
      typeof rawCursor === "string" ? parseInt(rawCursor, 10) : 0;

    const result = await listMyOngoingMissions(userId, cursor);
    res.status(200).json({
      success: true,
      code: "S200",
      message: "내 진행 중인 미션 목록 조회 성공",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

import { completeMyMission } from "../services/user.service.js";

export const handleCompleteMyMission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params["userId"]);
    const userMissionId = Number(req.params["userMissionId"]);

    if (isNaN(userId) || isNaN(userMissionId)) {
      res.status(400).json({
        success: false,
        message: "올바른 id가 아닙니다.",
      });
      return;
    }

    const result = await completeMyMission(userId, userMissionId);
    res.status(200).json({
      success: true,
      code: "S200",
      message: "미션 완료 처리 성공",
      data: result,
    });
  } catch (err) {
    const message = (err as Error).message;
    
    if (message === "존재하지 않는 미션 도전 기록입니다.") {
      res.status(404).json({ success: false, code: "E4040", message });
    } else if (message === "본인의 미션이 아닙니다.") {
      res.status(403).json({ success: false, code: "E4030", message });
    } else if (message === "진행 중인 미션이 아닙니다.") {
      res.status(400).json({ success: false, code: "E4000", message });
    } else {
      next(err);
    }
  }
};