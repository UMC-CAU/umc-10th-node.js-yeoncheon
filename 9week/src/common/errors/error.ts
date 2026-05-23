/**
 * [목적]
 * AppError를 상속해서 구체적 에러 시나리오별 클래스 정의.
 * 각 클래스는 errorCode + statusCode를 박아두고, message와 data만 인자로 받음.
 *
 * [에러 코드 명명 규칙 (UMC 컨벤션)]
 *   U001~ : User 도메인
 *   S001~ : Store 도메인
 *   M001~ : Mission 도메인
 *
 * [statusCode 가이드]
 *   400 : 요청 형식/값이 잘못됨 (validation)
 *   403 : 인증은 됐지만 접근 권한 없음
 *   404 : 리소스 없음
 *   409 : 충돌 (중복 등)
 */

import { AppError } from "./app.error.js";

// ========== User 도메인 ==========

/** 회원가입 시 이메일 중복 */
export class DuplicateUserEmailError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "U001", statusCode: 409, message, data });
  }
}

/** 로그인 사용자와 요청 대상 사용자가 일치하지 않음 */
export class UserForbiddenError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "U002", statusCode: 403, message, data });
  }
}

/** 존재하지 않는 사용자 */
export class UserNotFoundError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "U003", statusCode: 404, message, data });
  }
}

// ========== Store 도메인 ==========

/** 존재하지 않는 가게 참조 */
export class StoreNotFoundError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "S001", statusCode: 404, message, data });
  }
}

/** 리뷰 입력값 검증 실패 (평점 범위, 내용 비어있음 등) */
export class InvalidReviewError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "S002", statusCode: 400, message, data });
  }
}

// ========== Mission 도메인 ==========

/** 이미 도전 중인 미션을 다시 도전 시도 */
export class AlreadyChallengingMissionError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "M001", statusCode: 409, message, data });
  }
}

/** 존재하지 않는 user_mission 도전 기록 참조 */
export class UserMissionNotFoundError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "M002", statusCode: 404, message, data });
  }
}

/** 본인의 미션이 아닌데 조작 시도 (권한 없음) */
export class MissionForbiddenError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "M003", statusCode: 403, message, data });
  }
}

/** 미션 상태가 작업 가능 상태가 아님 (예: 이미 완료된 걸 또 완료 시도) */
export class MissionStateError extends AppError {
  constructor(message: string, data?: unknown) {
    super({ errorCode: "M004", statusCode: 400, message, data });
  }
}
