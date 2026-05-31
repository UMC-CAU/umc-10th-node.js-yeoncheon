/**
 * [목적]
 * 자바스크립트 기본 Error 클래스에는 'message'만 있음.
 * 우리는 에러 응답에 errorCode, statusCode, data 같은 부가 정보를 함께 담아야 해서
 * Error를 상속한 AppError 클래스를 만들어 씀.
 *
 * [구조]
 *   기본 Error:    { message }
 *   AppError 추가: { errorCode, statusCode, data }
 *
 * [사용 흐름]
 *   서비스에서:  throw new AppError({ errorCode: "U001", statusCode: 409, message: "...", data: ... })
 *   → 전역 에러 미들웨어가 이 객체의 statusCode/errorCode/message/data를 꺼내서
 *      통일된 실패 응답 봉투로 변환해서 클라이언트에 전송.
 *
 * [실제로는 서브클래스를 만들어 씀]
 * 서비스 코드가 `new AppError({ errorCode: "U001", ... })` 처럼 매번 객체를
 * 만들면 지저분함. 그래서 보통 DuplicateUserEmailError 같은 서브클래스를 만들어서
 * 각 에러의 errorCode/statusCode를 박아둠. (단계 3 참고)
 */

export class AppError extends Error {
  public readonly errorCode: string;   // 식별용 코드 (예: "U001")
  public readonly statusCode: number;  // HTTP 응답 상태 (예: 409)
  public readonly data?: unknown;      // 디버깅용 부가 정보 (선택)

  constructor(params?: {
    errorCode: string;
    message: string;
    statusCode: number;
    data?: unknown;
  }) {
    super(params?.message);
    this.errorCode = params?.errorCode ?? "UNKNOWN";
    this.statusCode = params?.statusCode ?? 500;
    this.data = params?.data ?? null;
  }
}
