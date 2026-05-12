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
  const missions = await Promise.all([
    prisma.mission.create({
      data: {
        store_id: 1,
        name: "첫 방문 리뷰 미션",
        description: "방문 후 리뷰를 작성하면 포인트를 드립니다.",
        reward: 500,
        deadline: new Date("2026-12-31"),
      },
    }),
    prisma.mission.create({
      data: {
        store_id: 1,
        name: "SNS 인증 미션",
        description: "인스타그램에 가게 사진을 올리고 인증하세요.",
        reward: 1000,
        deadline: new Date("2026-12-31"),
      },
    }),
    prisma.mission.create({
      data: {
        store_id: 1,
        name: "단골 고객 미션",
        description: "이번 달 3회 이상 방문 시 적립금을 드립니다.",
        reward: 2000,
        deadline: new Date("2026-12-31"),
      },
    }),
  ]);

  console.log(`✅ 미션 ${missions.length}개 삽입 완료`);
  missions.forEach((m) => console.log(`  - [${m.id}] ${m.name} (보상: ${m.reward}P)`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
