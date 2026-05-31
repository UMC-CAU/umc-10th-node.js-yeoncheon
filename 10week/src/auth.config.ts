import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import { prisma } from "./config/db.config.js";
import { user_gender } from "./generated/prisma/enums.js";

dotenv.config();

/**
 * Access Token 생성 함수
 *
 * Access Token은 실제 API 요청에서 사용되는 짧은 수명의 토큰이다.
 * 클라이언트는 로그인 후 이 토큰을 받아서,
 * 보호된 API를 호출할 때 Authorization 헤더에 넣어 보낸다.
 *
 * 예:
 * Authorization: Bearer accessToken값
 */
export const generateAccessToken = (user: { id: number; email: string }) => {
  return jwt.sign(
    // 토큰 안에 담을 사용자 정보
    { id: user.id, email: user.email },

    // 토큰 서명에 사용할 비밀 키
    process.env.JWT_SECRET!,

    // Access Token은 짧게 유지
    { expiresIn: "1h" },
  );
};

/**
 * Refresh Token 생성 함수
 *
 * Refresh Token은 Access Token보다 긴 수명을 가진 토큰이다.
 * 원래는 Access Token이 만료되었을 때 새 Access Token을 발급받는 데 사용한다.
 *
 * 이번 실습에서는 발급까지만 확인한다.
 */
export const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign(
    // Refresh Token에는 최소한의 정보만 넣는다.
    { id: user.id },

    // Access Token과 같은 비밀 키로 서명
    process.env.JWT_SECRET!,

    // Refresh Token은 더 오래 유지
    { expiresIn: "14d" },
  );
};

/**
 * Google 로그인 후 실행되는 사용자 확인 함수
 *
 * Google 로그인이 성공하면 Google에서 profile 정보를 넘겨준다.
 * 여기서 이메일을 꺼내 DB에 이미 가입된 사용자인지 확인한다.
 *
 * - 이미 가입된 이메일이면 기존 사용자 사용
 * - 처음 로그인한 이메일이면 DB에 새 사용자 생성
 */
const googleVerify = async (profile: Profile) => {
  // Google 계정의 이메일 꺼내기
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error("Google 프로필에 이메일이 없습니다.");
  }

  // 이메일로 기존 사용자 찾기
  let user = await prisma.user.findFirst({
    where: { email },
  });

  // 기존 사용자가 없으면 새 사용자 생성
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName ?? "Google User",

        // 네 Prisma schema의 gender는 enum이라서 문자열 "추후 수정"을 넣으면 안 된다.
        // 그래서 기본값으로 FEMALE을 넣어둔다.
        gender: user_gender.FEMALE,

        // 소셜 로그인에서는 아직 추가 정보를 받지 않으므로 임시값을 넣는다.
        birth: new Date("1970-01-01"),
        address: "추후 수정",
        detailAddress: "추후 수정",
        phoneNumber: "추후 수정",

        // Google 로그인 사용자는 비밀번호 로그인을 하지 않으므로 빈 문자열로 저장
        password: "",
      },
    });
  }

  // JWT를 만들 때 필요한 최소 사용자 정보 반환
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

/**
 * Google OAuth 로그인 전략
 *
 * passport-google-oauth20이 제공하는 GoogleStrategy를 사용한다.
 *
 * 동작 흐름:
 * 1. 사용자가 /oauth2/login/google 접속
 * 2. Google 로그인 화면으로 이동
 * 3. 로그인 성공 후 /oauth2/callback/google 로 돌아옴
 * 4. Google profile 정보를 받아 googleVerify 실행
 * 5. 사용자 확인 후 accessToken, refreshToken 발급
 */
export const googleStrategy = new GoogleStrategy(
  {
    // Google Cloud에서 발급받은 Client ID
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID!,

    // Google Cloud에서 발급받은 Client Secret
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET!,

    // Google Cloud의 승인된 리디렉션 URI와 정확히 같아야 한다.
    callbackURL:
      process.env.PASSPORT_GOOGLE_CALLBACK_URL ||
      "http://localhost:3000/oauth2/callback/google",

    // Google에서 받아올 사용자 정보 범위
    scope: ["email", "profile"],
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      // Google profile로 우리 서비스 사용자 확인 또는 생성
      const user = await googleVerify(profile);

      // 로그인 성공 후 클라이언트에게 줄 JWT 토큰들
      const tokens = {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };

      // Passport에게 인증 성공 결과 전달
      return cb(null, tokens);
    } catch (err) {
      // 인증 중 에러 발생 시 Passport에게 실패 전달
      return cb(err as Error);
    }
  },
);

/**
 * JWT 검증 전략
 *
 * 클라이언트가 Authorization 헤더에 담아 보낸 JWT를 검증한다.
 *
 * 예:
 * Authorization: Bearer accessToken값
 *
 * 검증 성공:
 * - payload.id로 DB에서 사용자 조회
 * - req.user에 사용자 정보가 들어감
 *
 * 검증 실패:
 * - Unauthorized 응답
 */
export const jwtStrategy = new JwtStrategy(
  {
    // Authorization: Bearer <token> 형식에서 token만 추출
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

    // 토큰을 만들 때 사용한 비밀 키와 같은 키로 검증
    secretOrKey: process.env.JWT_SECRET!,
  },
  async (payload, done) => {
    try {
      // 토큰 payload 안의 user id로 실제 사용자 조회
      const user = await prisma.user.findFirst({
        where: { id: payload.id },
      });

      // 사용자가 있으면 인증 성공, 없으면 인증 실패
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      // DB 조회 중 에러 발생
      return done(err, false);
    }
  },
);
