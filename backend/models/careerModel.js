import pool from "../db/mysql.js";
import crypto from "crypto";

const wrapCareer = (row) => {
  if (!row) return null;
  return {
    ...row,
    isActive: Boolean(row.isActive),
    toObject() {
      return { ...this };
    },
  };
};

class QueryCursor {
  constructor(queryPromise) {
    this.promise = queryPromise;
  }

  sort(sortOptions) {
    this.promise = this.promise.then((items) => {
      if (!Array.isArray(items)) return items;
      return items;
    });
    return this;
  }

  then(resolve, reject) {
    return this.promise.then(resolve, reject);
  }

  catch(reject) {
    return this.promise.catch(reject);
  }

  finally(callback) {
    return this.promise.finally(callback);
  }
}

export default class Career {
  static find(query = {}) {
    let sql = "SELECT * FROM careers ORDER BY createdAt DESC";
    const exec = async () => {
      const [rows] = await pool.query(sql);
      return rows.map(wrapCareer);
    };
    return new QueryCursor(exec());
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM careers WHERE _id = ? LIMIT 1", [id]);
    return wrapCareer(rows[0]);
  }

  static async create(data) {
    const _id = data._id || crypto.randomBytes(12).toString("hex");
    const isActive = data.isActive ? 1 : 0;

    await pool.query(
      `INSERT INTO careers (_id, postName, location, employmentType, experience, education, salary, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        _id,
        data.postName,
        data.location,
        data.employmentType,
        data.experience,
        data.education,
        data.salary,
        isActive,
      ]
    );

    return this.findById(_id);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const fields = [];
    const values = [];

    const allowed = ["postName", "location", "employmentType", "experience", "education", "salary"];
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        values.push(updateData[key]);
      }
    }

    if (updateData.isActive !== undefined) {
      fields.push("`isActive` = ?");
      values.push(updateData.isActive ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push("`updatedAt` = NOW()");
      values.push(id);
      const sql = `UPDATE careers SET ${fields.join(", ")} WHERE _id = ?`;
      await pool.query(sql, values);
    }

    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.query("DELETE FROM careers WHERE _id = ?", [id]);
    return existing;
  }
}
