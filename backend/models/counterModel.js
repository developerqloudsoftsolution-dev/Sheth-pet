import pool from "../db/mysql.js";
import crypto from "crypto";

export default class Counter {
  static async findOneAndUpdate(filter = {}, update = {}, options = {}) {
    const name = filter.name || "productSku";
    const inc = (update.$inc && update.$inc.sequence) || 1;
    const _id = crypto.randomBytes(12).toString("hex");

    await pool.query(
      `INSERT INTO counters (_id, name, sequence) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE sequence = sequence + ?`,
      [_id, name, inc, inc]
    );

    const [rows] = await pool.query(
      "SELECT * FROM counters WHERE name = ? LIMIT 1",
      [name]
    );
    return rows[0] || { name, sequence: inc };
  }
}
