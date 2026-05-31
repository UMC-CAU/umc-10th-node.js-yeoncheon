# 8주차 학습 정리

날짜: 2026-05-19

---

## 1. 7주차 코드를 8주차로 복사

7주차 실습 코드를 보존하면서 8주차 내용을 따로 진행하기 위해 `7week` 폴더를 `8week`로 복사했다.

```powershell
cd C:\dev\umc-10th-node.js-yeoncheon
Copy-Item -Recurse .\7week .\8week
cd .\8week
```

주의할 점:

- `.\7week` 안에서 `Copy-Item -Recurse .\7week .\8week`를 실행하면 `7week\7week`를 찾게 되어 에러가 난다.
- VS Code의 Explorer가 아직 `7WEEK`로 보이면 터미널 위치만 바뀐 것이고, VS Code에서 연 폴더는 그대로인 상태다.
- `8week`를 VS Code에서 열려면 아래처럼 실행한다.

```powershell
code . -r
```

---

## 2. CORS 개념

CORS는 `Cross-Origin Resource Sharing`의 줄임말이다.

브라우저는 보안을 위해 기본적으로 다른 출처의 서버로 요청을 보내는 것을 제한한다. 이 보안 규칙을 `SOP`, 즉 동일 출처 정책이라고 한다.

예를 들어 다음 두 주소는 서로 다른 출처다.

```text
http://127.0.0.1:5500
http://localhost:3000
```

포트가 다르기 때문에 브라우저 입장에서는 서로 다른 출처로 본다.

그래서 프론트엔드가 `5500`번 포트에서 열려 있고, 백엔드 API가 `3000`번 포트에서 동작하면 CORS 설정이 필요하다.

현재 서버에는 이미 CORS 기본 설정이 들어가 있었다.

```ts
app.use(cors());
```

---

## 3. Preflight 요청

브라우저는 실제 요청을 보내기 전에 먼저 `OPTIONS` 요청을 보내서 서버가 해당 요청을 허용하는지 확인할 수 있다.

이 확인 요청을 `Preflight` 요청이라고 한다.

주로 확인하는 정보:

- 어떤 출처를 허용하는지
- 어떤 HTTP 메서드를 허용하는지
- 어떤 요청 헤더를 허용하는지
- 쿠키 같은 인증 정보를 포함해도 되는지

관련 응답 헤더:

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Credentials`
- `Access-Control-Max-Age`

---

## 4. 프론트엔드에서 백엔드 API 호출 실습

`test.html`을 만들고 Live Server로 실행해서 프론트엔드에서 백엔드 API를 호출해 보았다.

프론트엔드 주소:

```text
http://127.0.0.1:5500/test.html
```

백엔드 주소:

```text
http://localhost:3000
```

이렇게 일부러 서로 다른 출처에서 실행해서 브라우저와 백엔드가 어떻게 통신하는지 확인했다.

백엔드 서버 실행:

```powershell
npm.cmd run start
```

PowerShell에서 `npm run start`가 막힐 수 있으므로 `npm.cmd run start`를 사용했다.

---

## 5. 회원가입 API 성공 응답 확인

성공 버튼을 누르면 매번 다른 이메일을 만들어 회원가입 요청을 보낸다.

요청 경로:

```text
POST /api/v1/users/signup
```

성공하면 콘솔에서 다음과 같은 표준 성공 응답을 확인할 수 있다.

```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    "id": 1,
    "email": "test_...",
    "name": "UMC"
  }
}
```

여기서 중요한 점은 백엔드가 단순 데이터만 주는 것이 아니라 7주차에 만든 표준 응답 형식으로 내려준다는 것이다.

---

## 6. 회원가입 API 실패 응답 확인

실패 버튼은 같은 이메일로 회원가입을 다시 요청해서 중복 이메일 에러를 확인했다.

중복 이메일이면 HTTP 상태 코드는 `409 Conflict`가 된다.

콘솔에서 다음과 같은 표준 실패 응답을 확인했다.

```json
{
  "resultType": "FAIL",
  "error": {
    "errorCode": "U001",
    "reason": "이미 존재하는 이메일입니다.",
    "data": {}
  },
  "success": null
}
```

이 실습을 통해 7주차에 만든 표준 에러 핸들링이 왜 필요한지 확인했다.

프론트엔드는 이런 실패 응답을 보고 사용자에게 적절한 안내를 보여줄 수 있다.

---

## 7. Swagger 개념

Swagger는 API 명세를 문서화하고 테스트할 수 있게 도와주는 도구다.

백엔드 개발자는 Swagger를 통해 프론트엔드에게 다음 정보를 알려줄 수 있다.

- 어떤 API가 있는지
- 어떤 HTTP 메서드를 쓰는지
- 요청 body에 어떤 값이 필요한지
- path parameter, query parameter가 무엇인지
- 성공 응답과 실패 응답 형식이 어떤지

---

## 8. Swagger UI 연결

TSOA가 이미 `dist/swagger.json`을 생성하므로, 별도의 `swagger-autogen`은 사용하지 않았다.

설치한 라이브러리:

```powershell
npm.cmd install swagger-ui-express
npm.cmd install --save-dev @types/swagger-ui-express
```

`src/index.ts`에 Swagger UI를 연결했다.

```ts
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve("dist/swagger.json"), "utf8"),
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
```

Swagger 접속 주소:

```text
http://localhost:3000/docs
```

---

## 9. TSOA basePath 설정

실제 API는 `/api/v1` 아래에 등록되어 있다.

```ts
app.use("/api/v1", tsoaRouter);
```

그래서 Swagger 문서에도 기본 경로를 알려주기 위해 `tsoa.json`에 `basePath`를 추가했다.

```json
{
  "spec": {
    "outputDirectory": "dist",
    "specVersion": 3,
    "basePath": "/api/v1"
  }
}
```

이 설정 덕분에 Swagger UI 상단 서버 주소가 `/api/v1`로 표시된다.

---

## 10. TSOA 데코레이터로 API 설명 추가

회원가입 API에 Swagger 설명을 추가했다.

```ts
/**
 * 회원가입 API
 * @summary 회원가입을 처리하는 엔드포인트입니다.
 */
@Post("signup")
@SuccessResponse(200, "회원가입 성공")
@Response<ApiErrorResponse>(409, "중복된 이메일 에러")
public async handleUserSignUp(
  @Body() body: UserSignUpRequest,
): Promise<ApiResponse<UserSignUpResponse>> {
  const user = await userSignUp(body);
  return success(user);
}
```

추가로 DTO에도 주석을 달아서 Swagger에서 요청 필드 설명을 볼 수 있게 했다.

```ts
export interface UserSignUpRequest {
  /** 유저 이메일 (로그인 시 사용) */
  email: string;
  /** 유저 이름 */
  name: string;
  /** 비밀번호 */
  password: string;
}
```

---

## 11. 실패 응답 타입 추가

7주차 표준 실패 응답을 Swagger에 정확히 보여주기 위해 `ApiErrorResponse` 타입을 추가했다.

```ts
export interface ApiErrorResponse {
  resultType: "FAIL";
  error: {
    errorCode: string | null;
    reason: string | null;
    data: unknown;
  };
  success: null;
}
```

이 타입을 `@Response<ApiErrorResponse>`에 사용하면 Swagger에서 실패 응답 구조를 문서화할 수 있다.

---

## 12. package 이름 변경

서버를 실행할 때 계속 `5week`로 표시되던 이유는 `package.json`의 이름이 아직 `5week`였기 때문이다.

수정 전:

```json
{
  "name": "5week"
}
```

수정 후:

```json
{
  "name": "8week"
}
```

`package-lock.json`도 같이 변경했다.

이후 Swagger 문서를 다시 생성했다.

```powershell
npm.cmd exec -- tsoa spec-and-routes
```

---

## 13. 오늘 사용한 주요 명령어

```powershell
cd C:\dev\umc-10th-node.js-yeoncheon
Copy-Item -Recurse .\7week .\8week
cd .\8week
code . -r
```

```powershell
npm.cmd run start
```

```powershell
npm.cmd install swagger-ui-express
npm.cmd install --save-dev @types/swagger-ui-express
```

```powershell
npm.cmd exec -- tsoa spec-and-routes
npm.cmd exec -- tsc --noEmit
```

---

## 14. 최종 확인한 것

- `8week` 폴더를 새로 만들어 8주차 실습을 진행했다.
- CORS가 왜 필요한지 이해했다.
- Live Server로 프론트엔드와 백엔드를 다른 출처에서 실행했다.
- 프론트엔드에서 회원가입 API를 호출했다.
- 성공 응답과 실패 응답을 브라우저 콘솔에서 확인했다.
- 7주차 표준 에러 핸들링이 프론트엔드에 어떻게 전달되는지 확인했다.
- Swagger UI를 `/docs` 경로에 연결했다.
- TSOA 문서에 `basePath`, API 설명, 응답 타입, DTO 필드 설명을 추가했다.
- 실행 시 표시되는 프로젝트 이름을 `8week`로 수정했다.

