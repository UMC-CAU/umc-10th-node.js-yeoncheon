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
  const result = await prisma.user_mission.createMany({
    data: [
      { user_id: 2, mission_id: 1, status: "도전중" },
      { user_id: 2, mission_id: 2, status: "도전중" },
      { user_id: 2, mission_id: 3, status: "도전중" },
    ],
  });

  console.log(`✅ 진행 중인 미션 ${result.count}개 삽입 완료 (user_id: 2)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
