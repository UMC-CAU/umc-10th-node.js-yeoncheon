import { pool } from "../../../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const addStore = async (data: { region_id: number; name: string; address: string }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO store (region_id, name, address) VALUES (?, ?, ?)",
      [data.region_id, data.name, data.address]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};

export const getStoreById = async (storeId: number) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id, name FROM store WHERE id = ?",
      [storeId]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
};

export const addReview = async (data: { store_id: number; user_id: number; content: string; rating: number }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO store_review (store_id, user_id, content, rating) VALUES (?, ?, ?, ?)",
      [data.store_id, data.user_id, data.content, data.rating]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
};