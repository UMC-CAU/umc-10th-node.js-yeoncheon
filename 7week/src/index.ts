/**
 * [7주차 변경]
 * - morgan, cookie-parser 추가
 * - res.error() 메서드 주입
 * - tsoa RegisterRoutes 사용
 * - 전역 에러 미들웨어 추가
 */

import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { RegisterRoutes } from "./generated/routes.js";

import { AppError } from "./common/errors/app.error.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

/**
 * 기본 미들웨어 등록
 */
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * res.error() 메서드 주입
 * FAIL 응답 형식 통일
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.error = function ({
    errorCode = null,
    reason = null,
    data = null,
  }) {
    return this.json({
      resultType: "FAIL",
      error: {
        errorCode,
        reason,
        data,
      },
      success: null,
    });
  };

  next();
});

/**
 * tsoa 라우터 등록
 * User / Store / Mission Controller 자동 연결
 */
const tsoaRouter = express.Router();

RegisterRoutes(tsoaRouter);

app.use("/api/v1", tsoaRouter);

/**
 * 기본 테스트 라우트
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

/**
 * 전역 에러 미들웨어
 * 모든 throw AppError 처리
 */
app.use(
  (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    // 이미 응답 보낸 경우 Express 기본 처리로 넘김
    if (res.headersSent) {
      return next(err);
    }

    return res.status(err.statusCode || 500).error({
      errorCode: err.errorCode || "unknown",
      reason: err.message || null,
      data: err.data || null,
    });
  },
);

/**
 * 서버 실행
 */
app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port}`,
  );
});