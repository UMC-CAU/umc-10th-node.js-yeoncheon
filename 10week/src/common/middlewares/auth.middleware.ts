/**
 * [목적]
 * 보호된 라우트(/mypage 등)에 접근하기 전에 "로그인 했나?"를 확인하는 미들웨어.
 *
 * [동작 흐름]
 *   요청 → authorizeUser → (쿠키에 username 있나?)
 *     ├─ 있음 → next() 호출 → 컨트롤러 메서드 실행됨
 *     └─ 없음 → 401 응답 보내고 끝 (next 안 부름 → 컨트롤러까지 안 감)
 *
 * [왜 함수가 함수를 반환하는 구조?]
 * authorizeUser() 처럼 호출해야 미들웨어가 나옴. 이건 "고차 함수" 패턴인데,
 * 나중에 옵션을 받아서 동작을 바꾸고 싶을 때(예: authorizeUser({ role: "admin" }))
 * 확장하기 좋게 미리 함수 형태로 잡아둔 거임.
 *
 * [주의 — 보안]
 * 지금은 쿠키 값(username 문자열)을 그대로 신뢰. 누구나 브라우저 개발자도구에서
 * 쿠키 위조 가능. 실제 서비스는 9주차의 JWT(서명된 토큰)로 대체해야 안전함.
 */
import { Request, Response, NextFunction } from "express";

export function authorizeUser() {
  // 반환되는 이 함수가 진짜 미들웨어 (req, res, next 받음)
  return async (req: Request, res: Response, next: NextFunction) => {
    // cookie-parser가 채워준 req.cookies 객체에서 username 꺼냄
    const { username } = req.cookies;

    if (username) {
      // 통과: 로그 찍고 다음 단계로
      console.log(`[인증 성공] ${username}님, 환영합니다.`);
      next();
    } else {
      // 차단: 401 응답 후 종료. next() 호출 안 함.
      console.log("[인증 실패] 로그인이 필요합니다.");
      res
        .status(401)
        .send(
          '<script>alert("로그인이 필요합니다!");location.href="/api/v1/users/login";</script>',
        );
    }
  };
}
