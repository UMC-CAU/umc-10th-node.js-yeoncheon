import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createMission, challengeMission } from "../services/mission.service";
import { MissionAddRequest } from "../dtos/mission.dtos";

export const handleAddMission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("미션 추가를 요청했습니다!");
    const storeId = parseInt(req.params.storeId as string);
    const body: MissionAddRequest = {
      storeId,
      name: req.body.name,
      description: req.body.description,
      reward: req.body.reward,
      deadline: req.body.deadline,
    };

    const mission = await createMission(body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "미션 추가 성공",
      data: mission,
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

export const handleChallengeMission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("미션 도전을 요청했습니다!");
    const missionId = parseInt(req.params.missionId as string);
    const userId = 2;  // DB에 있는 유저 id

    const result = await challengeMission(userId, missionId);
    res.status(StatusCodes.CREATED).json({
      success: true,
      code: "S201",
      message: "미션 도전 성공",
      data: result,
    });
  } catch (err) {
    console.log("Error:", err);
    if ((err as Error).message === "이미 도전 중인 미션입니다.") {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        code: "E4090",
        message: "이미 도전 중인 미션입니다.",
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