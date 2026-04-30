import { pool } from "../../../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const addUser = async (data: {
  email: string; name: string; gender: string; birth: string;
  address: string; detail_address: string; phone_number: string; password: string;
}) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO user (email, name, gender, birth, address, detail_address, phone_number, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [data.email, data.name, data.gender, data.birth, data.address, data.detail_address, data.phone_number, data.password]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};

export const getUserByEmail = async (email: string) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id, email FROM user WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
};

export const setPreference = async (userId: number, foodCategoryId: number) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO user_favor_category (user_id, food_category_id) VALUES (?, ?)",
      [userId, foodCategoryId]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};