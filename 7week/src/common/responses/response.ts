/**
 * [목적]
 * 모든 API의 "성공 응답"을 같은 봉투에 담기 위한 헬퍼.
 *
 * [사용법]
 *   컨트롤러에서:
 *     return success(user);
 *   →  { resultType: "SUCCESS", error: null, success: user }  형태로 직렬화됨
 *
 * [왜 헬퍼 함수인가?]
 * TSOA가 응답 직렬화를 담당하기 때문에, 순수 Express처럼 미들웨어 한 줄로
 * 모든 응답을 wrap할 수가 없음. 컨트롤러 반환 직전에 명시적으로 감싸야 함.
 * 함수로 만들어두면:
 *   1) 형태 변경 시 한 곳만 고치면 됨
 *   2) 제네릭 <T> 로 데이터 타입을 보존해서 자동완성도 그대로 동작
 */

export interface ApiResponse<T> {
  resultType: "SUCCESS";
  error: null;
  // 워크북 명세를 따라 필드명은 'success' (워크북 코드에는 'data'로 돼있는데 모순)
  success: T;
}

export const success = <T>(data: T): ApiResponse<T> => ({
  resultType: "SUCCESS",
  error: null,
  success: data,
});
