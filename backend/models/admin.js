import pool from "../db/mysql.js";
import crypto from "crypto";

const wrapAdmin = (row) => {
  if (!row) return null;
  const admin = { ...row };
  admin.toObject = function () {
    return { ...this };
  };
  admin.save = async function () {
    await pool.query(
      `UPDATE admins 
       SET email = ?, password = ?, otp = ?, otpExpiry = ?, updatedAt = NOW() 
       WHERE _id = ?`,
      [
        this.email,
        this.password,
        this.otp || null,
        this.otpExpiry ? new Date(this.otpExpiry) : null,
        this._id,
      ]
    );
    return this;
  };
  return admin;
};

export default class Admin {
  constructor(data = {}) {
    this._id = data._id || crypto.randomBytes(12).toString("hex");
    this.email = data.email;
    this.password = data.password;
    this.otp = data.otp || null;
    this.otpExpiry = data.otpExpiry || null;
  }

  async save() {
    await pool.query(
      `INSERT INTO admins (_id, email, password, otp, otpExpiry, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
         password = VALUES(password),
         otp = VALUES(otp),
         otpExpiry = VALUES(otpExpiry),
         updatedAt = NOW()`,
      [
        this._id,
        this.email,
        this.password,
        this.otp || null,
        this.otpExpiry ? new Date(this.otpExpiry) : null,
      ]
    );
    return wrapAdmin(this);
  }

  static async findOne(query = {}) {
    if (query.email) {
      const [rows] = await pool.query(
        "SELECT * FROM admins WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [query.email]
      );
      return wrapAdmin(rows[0]);
    }
    if (query._id) {
      const [rows] = await pool.query(
        "SELECT * FROM admins WHERE _id = ? LIMIT 1",
        [query._id]
      );
      return wrapAdmin(rows[0]);
    }
    const [rows] = await pool.query("SELECT * FROM admins LIMIT 1");
    return wrapAdmin(rows[0]);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE _id = ? LIMIT 1",
      [id]
    );
    return wrapAdmin(rows[0]);
  }

  static async create(data) {
    const admin = new Admin(data);
    await admin.save();
    return admin;
  }
}
