# tsoa.json 설정 설명

JSON 파일에는 주석을 못 달아서 여기에 따로 정리.

```json
{
  "entryFile": "src/index.ts",
  "noImplicitAdditionalProperties": "throw-on-extras",
  "controllerPathGlobs": ["src/**/*.controller.ts"],
  "spec": {
    "outputDirectory": "dist",
    "specVersion": 3
  },
  "routes": {
    "routesDir": "src/generated"
  }
}
```

## 각 옵션의 의미

- **entryFile**: TSOA가 타입 정보를 따라가기 시작하는 파일. 보통 서버 진입점.
- **noImplicitAdditionalProperties: "throw-on-extras"**: 요청 본문에 DTO에 정의되지 않은 필드가 섞여 들어오면 422 에러로 거부. (보안/일관성을 위한 strict 모드.)
- **controllerPathGlobs**: TSOA가 컨트롤러를 찾는 패턴. 이 패턴에 맞지 않는 파일(예: `user.controllers.ts` 복수형)은 무시됨 → 그래서 파일명을 `user.controller.ts`로 맞춰야 함.
- **spec.outputDirectory**: Swagger 스펙(`swagger.json`)이 출력될 폴더. `dist/swagger.json`이 생성됨.
- **spec.specVersion**: OpenAPI 3. (2는 옛날 Swagger 스펙)
- **routes.routesDir**: 자동 생성된 `routes.ts`가 위치할 폴더. 이미 `src/generated/prisma/`가 있지만 충돌 없음 (`routes.ts`만 그 옆에 생김).

## 생성되는 파일

`npx tsoa spec-and-routes` 실행 시:
- `src/generated/routes.ts` ← `RegisterRoutes(router)` 함수가 정의됨. index.ts에서 import.
- `dist/swagger.json` ← Swagger UI에 띄울 OpenAPI 스펙.

---

# package.json scripts 변경 설명

```json
"scripts": {
  "start": "tsoa spec-and-routes && tsx src/index.ts",
  "dev":   "tsoa spec-and-routes && nodemon --exec tsx src/index.ts"
}
```

- **`tsoa spec-and-routes &&`**: 서버 실행 전에 항상 라우트/스펙을 새로 생성.
  - 컨트롤러를 수정했으면 `src/generated/routes.ts`도 새로 생성돼야 변경이 반영됨.
  - 까먹고 직접 생성 안 해도 `npm start`만 누르면 자동.
- **`tsx src/index.ts`**: TypeScript 파일을 그대로 실행 (별도 컴파일 단계 불필요).
- **`nodemon --exec tsx ...`**: 코드 변경 감지 시 자동 재시작.
  - 단, `tsoa spec-and-routes`는 처음 한 번만 실행됨 → 컨트롤러 데코레이터를 수정했다면 dev 서버를 재시작해야 적용됨.
