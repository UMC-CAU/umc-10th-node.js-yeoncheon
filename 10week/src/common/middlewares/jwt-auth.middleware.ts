import passport from "passport";
import { Request } from "express";

/**
 * JWT 인증 미들웨어
 *
 * Authorization: Bearer <accessToken> 헤더를 passport-jwt 전략으로 검증한다.
 * 인증에 성공하면 passport가 DB에서 조회한 사용자 정보를 req.user에 넣어준다.
 */
export const authenticateJwt = passport.authenticate("jwt", {
  session: false,
});

/**
 * 컨트롤러에서 사용할 로그인 사용자 타입
 *
 * 실제 req.user에는 Prisma User 객체 전체가 들어오지만,
 * API 로직에서는 우선 id/email/name만 필요하므로 최소 필드만 정의한다.
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
}

/**
 * req.user를 안전하게 꺼내기 위한 헬퍼
 *
 * authenticateJwt를 통과한 요청에서만 호출한다는 전제로 사용한다.
 */
export const getAuthenticatedUser = (req: Request): AuthenticatedUser => {
  return req.user as AuthenticatedUser;
};
