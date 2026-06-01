/**
 * [목적]
 * Express의 Response 객체에 우리가 직접 만든 .error() 메서드를 붙일 건데,
 * TypeScript는 기본 Response 타입에 그런 메서드가 없다고 컴파일 에러를 냄.
 * 그래서 "선언 병합(declaration merging)"으로 타입을 확장해서 알려줌.
 *
 * [동작 원리]
 * declare global namespace Express { interface Response { ... } }
 * 이렇게 쓰면 @types/express가 정의한 Response interface에 우리 메서드가 합쳐짐.
 *
 * [파일 위치]
 * .d.ts 파일은 코드 실행과 무관한 "타입 선언 전용" 파일.
 * tsconfig.json의 include 패턴(src/**\/*)에 포함되니까 따로 import 안 해도 적용됨.
 */

import "express";

declare global {
  namespace Express {
    interface Response {
      error: (params: {
        errorCode?: string | null;
        reason?: string | null;
        data?: unknown;
      }) => Response;
    }
  }
}

// 이 줄이 없으면 파일이 "global script"로 취급돼서 declare global이 동작 안 함.
// 빈 export 하나로 "module" 파일임을 알려주는 트릭.
export {};
