# Postman 테스트 예시

Base URL: `http://localhost:3000/api/v1`

---

## ① 회원가입

**POST** `/users/signup`

Headers:
```
Content-Type: application/json
```

Body (raw → JSON):

```json
{
  "email": "junhyung1@test.com",
  "name": "안준형",
  "gender": "남성",
  "birth": "2000-04-23",
  "address": "서울시 마포구",
  "detailAddress": "101동 202호",
  "phoneNumber": "010-1234-5678",
  "password": "qwer1234!",
  "preferences": [1, 2]
}
```

### 필드 설명
- `email`: 유니크. 이미 있으면 500 에러 (서비스에서 throw)
- `gender`: `"남성"` 또는 `"여성"` — repository의 genderMap이 `"MALE"`/`"FEMALE"`로 변환
- `birth`: ISO 날짜 문자열. 서비스/repository에서 `new Date()`로 파싱
- `password`: 평문으로 보내면 bcrypt로 해싱되어 저장
- `preferences`: `food_category` 테이블의 id 배열. seed에서 만든 카테고리 id를 넣어야 함 (없으면 FK 에러)
- `address`, `detailAddress`, `phoneNumber`: 필수 필드 (DTO에 ? 안 붙음 → 빠지면 422)

### 예상 응답 (200)
```json
{
  "id": 4,
  "email": "junhyung1@test.com",
  "name": "안준형"
}
```

### 만약 422가 뜨면
- DTO에 정의되지 않은 필드를 보냈을 가능성 (예: `nickname`) → `tsoa.json`의 `noImplicitAdditionalProperties: "throw-on-extras"` 때문
- 또는 필수 필드 누락

---

## ② 내가 쓴 리뷰 목록

**GET** `/users/1/reviews?cursor=0`

- Path: `userId = 1` (seed에서 만든 user1@test.com의 id)
- Query: `cursor=0` 처음부터 5건씩

### 예상 응답
```json
{
  "data": [
    {
      "id": 1,
      "storeId": 1,
      "storeName": "맛있는 식당",
      "content": "음식이 정말 맛있어요! 또 오고 싶네요.",
      "rating": 5,
      "createdAt": "2026-05-07T..."
    }
  ],
  "pagination": { "cursor": 1 }
}
```

다음 페이지: `?cursor=1` 로 다시 호출.

---

## ③ 내가 도전 중인 미션 목록

**GET** `/users/1/missions?cursor=0`

### 예상 응답
```json
{
  "data": [
    {
      "userMissionId": 1,
      "status": "도전중",
      "startedAt": "2026-05-07T...",
      "mission": {
        "id": 1,
        "name": "...",
        "description": "...",
        "reward": 100,
        "deadline": null
      },
      "store": { "id": 1, "name": "맛있는 식당" }
    }
  ],
  "pagination": { "cursor": 1 }
}
```

---

## ④ 미션 완료 처리

**PATCH** `/users/1/missions/1/complete`

Body 없음.

### 예상 응답
```json
{
  "userMissionId": 1,
  "status": "완료",
  "completedMission": { "id": 1, "name": "...", "reward": 100 },
  "store": { "id": 1, "name": "맛있는 식당" }
}
```

### 에러 케이스
- 다른 사람 미션이면 → 500 (현재) — 추후 403으로 매핑 가능
- 이미 "완료"인 미션이면 → 500 (현재) — 추후 400으로 매핑 가능

---

## 실행 순서

```bash
cd 7week
npm install
npm run start
```

`http://localhost:3000` 으로 접속해서 "Hello World..." 보이면 OK.
그 다음 Postman으로 위 요청들 보내면 됨.

> seed 안 돌렸으면 먼저 돌려야 user/store/review 데이터가 생김:
> `npx prisma db seed` (또는 너 프로젝트의 seed 스크립트)
