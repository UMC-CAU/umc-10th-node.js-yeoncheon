import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userSignUp } from "../services/user.service";
import { UserSignUpRequest } from "../dtos/user.dto";

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