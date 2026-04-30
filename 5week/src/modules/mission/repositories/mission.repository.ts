import { pool } from "../../../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const addMission = async (data: { store_id: number; name: string; description: string; reward: number; deadline: string }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO mission (store_id, name, description, reward, deadline) VALUES (?, ?, ?, ?, ?)",
      [data.store_id, data.name, data.description, data.reward, data.deadline]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};

export const getUserMission = async (userId: number, missionId: number) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM user_mission WHERE user_id = ? AND mission_id = ? AND status = '도전중'",
      [userId, missionId]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
};

export const addUserMission = async (userId: number, missionId: number) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO user_mission (user_id, mission_id) VALUES (?, ?)",
      [userId, missionId]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};