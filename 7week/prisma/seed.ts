import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 지역 생성
  const region = await prisma.region.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "서울" },
  });

  // 가게 생성
  const store = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, region_id: region.id, name: "맛있는 식당", address: "서울시 강남구 123" },
  });

  // 유저 3명 생성
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "user1@test.com" },
      update: {},
      create: {
        email: "user1@test.com", name: "김철수", gender: "MALE",
        birth: new Date("1995-03-15"), address: "서울시 강남구",
        phoneNumber: "010-1111-2222", password: "hashed_pw",
      },
    }),
    prisma.user.upsert({
      where: { email: "user2@test.com" },
      update: {},
      create: {
        email: "user2@test.com", name: "이영희", gender: "FEMALE",
        birth: new Date("1998-07-22"), address: "서울시 마포구",
        phoneNumber: "010-3333-4444", password: "hashed_pw",
      },
    }),
    prisma.user.upsert({
      where: { email: "user3@test.com" },
      update: {},
      create: {
        email: "user3@test.com", name: "박민준", gender: "MALE",
        birth: new Date("2000-11-01"), address: "서울시 송파구",
        phoneNumber: "010-5555-6666", password: "hashed_pw",
      },
    }),
  ]);

  // 리뷰 12개 생성
  const reviewData = [
    { userId: users[0]!.id, content: "음식이 정말 맛있어요! 또 오고 싶네요.", rating: 5.0 },
    { userId: users[1]!.id, content: "서비스가 친절하고 분위기도 좋았습니다.", rating: 4.5 },
    { userId: users[2]!.id, content: "가격 대비 양이 많아서 만족스러웠어요.", rating: 4.0 },
    { userId: users[0]!.id, content: "주차 공간이 넓어서 편하게 방문했습니다.", rating: 4.5 },
    { userId: users[1]!.id, content: "음식 맛은 괜찮은데 웨이팅이 좀 길었어요.", rating: 3.5 },
    { userId: users[2]!.id, content: "재료가 신선하고 조리도 깔끔하게 잘 되어 있어요.", rating: 5.0 },
    { userId: users[0]!.id, content: "단골로 자주 오고 싶은 곳입니다.", rating: 4.5 },
    { userId: users[1]!.id, content: "식당이 깔끔하고 직원분들이 친절해요.", rating: 4.0 },
    { userId: users[2]!.id, content: "처음 왔는데 기대 이상으로 맛있었어요.", rating: 4.5 },
    { userId: users[0]!.id, content: "점심 특선 메뉴가 정말 합리적이에요.", rating: 4.0 },
    { userId: users[1]!.id, content: "음식이 빨리 나오고 맛도 좋아요.", rating: 3.5 },
    { userId: users[2]!.id, content: "디저트까지 완벽한 한 끼였습니다.", rating: 5.0 },
  ];

  for (const review of reviewData) {
    await prisma.store_review.create({
      data: {
        store_id: store.id,
        user_id: review.userId,
        content: review.content,
        rating: review.rating,
      },
    });
  }

  console.log(`✅ 시드 완료: 가게 1개, 유저 3명, 리뷰 12개 삽입`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
