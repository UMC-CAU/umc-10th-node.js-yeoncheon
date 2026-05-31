import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";

import { RegisterRoutes } from "./generated/routes.js";

import { AppError } from "./common/errors/app.error.js";

import passport from "passport";
import { googleStrategy, jwtStrategy } from "./auth.config.js";
import { success } from "./common/responses/response.js";

dotenv.config();

/**
 * Passport 인증 전략 등록
 *
 * googleStrategy:
 * - /oauth2/login/google 로 Google 로그인 시작
 * - 로그인 성공 후 JWT accessToken / refreshToken 발급
 *
 * jwtStrategy:
 * - Authorization: Bearer <token> 헤더의 JWT 검증
 * - 보호된 API에서 로그인 여부를 확인할 때 사용
 */
passport.use(googleStrategy);
passport.use(jwtStrategy);

const app: Express = express();
const port = process.env.PORT || 3000;
const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve("dist/swagger.json"), "utf8"),
);

/**
 * 기본 미들웨어 등록
 */
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors()); // cors 방식 허용
app.use(express.static("public")); // 정적 파일 접근
app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석
/**
 * Passport 초기화 미들웨어
 *
 * passport.authenticate(...)가 요청을 처리할 수 있도록 Express 앱에 Passport를 연결한다.
 * JWT 방식은 서버 세션을 사용하지 않으므로 별도의 session 설정은 하지 않는다.
 */
app.use(passport.initialize());

/**
 * Swagger UI
 * tsoa spec-and-routes 명령으로 생성된 dist/swagger.json을 화면으로 보여줌
 */
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
 * Google OAuth 로그인 시작 라우트
 *
 * 브라우저에서 이 주소로 접속하면 Google 로그인 화면으로 이동한다.
 * session: false는 서버 세션을 만들지 않고 JWT 방식으로 처리하겠다는 뜻이다.
 */
app.get(
  "/oauth2/login/google",
  passport.authenticate("google", { session: false }),
);

/**
 * Google OAuth 콜백 라우트
 *
 * Google 로그인이 끝나면 Google이 사용자를 이 주소로 다시 보내준다.
 * googleStrategy가 성공하면 req.user에는 accessToken / refreshToken 객체가 들어간다.
 */
app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  (req: Request, res: Response) => {
    return res.status(200).json(success(req.user));
  },
);

/**
 * Google 로그인 실패 라우트
 *
 * OAuth 과정에서 실패하면 이 주소로 이동한다.
 * 7주차에서 만든 표준 실패 응답 형식으로 내려준다.
 */
app.get("/login-failed", (req: Request, res: Response) => {
  return res.status(401).error({
    errorCode: "AUTH001",
    reason: "Google 로그인에 실패했습니다.",
    data: null,
  });
});

/**
 * JWT 인증 미들웨어
 *
 * Authorization 헤더에서 Bearer 토큰을 꺼내 jwtStrategy로 검증한다.
 * 검증에 성공하면 req.user에 DB에서 조회한 사용자 정보가 들어간다.
 */
const isLogin = passport.authenticate("jwt", { session: false });

/**
 * JWT 보호 라우트 테스트
 *
 * 토큰 없이 GET /mypage 요청:
 * - 401 Unauthorized
 *
 * 토큰을 넣고 GET /mypage 요청:
 * - Authorization: Bearer <accessToken>
 * - 인증 성공 응답 반환
 */
app.get("/mypage", isLogin, (req: Request, res: Response) => {
  const user = req.user as {
    id: number;
    email: string;
    name: string;
  };

  return res.status(200).json(
    success({
      message: `인증 성공! ${user.name}님의 마이페이지입니다.`,
      user,
    }),
  );
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
