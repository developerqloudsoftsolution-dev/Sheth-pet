import pool from "../db/mysql.js";
import crypto from "crypto";

const wrapCategory = (row) => {
  if (!row) return null;
  return {
    ...row,
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

export default class Category {
  static find(query = {}) {
    let sql = "SELECT * FROM categories";
    if (query.name && query.name.$not) {
      sql += " WHERE LOWER(name) != LOWER('Containers')";
    }
    sql += " ORDER BY name ASC";
    const exec = async () => {
      const [rows] = await pool.query(sql);
      return rows.map(wrapCategory);
    };
    return new QueryCursor(exec());
  }

  static async findOne(query = {}) {
    if (query.name) {
      let catName = query.name;
      if (typeof catName === "object" && catName.$regex) {
        catName = String(catName.$regex)
          .replace(/^\^|\$$/g, "")
          .replace(/\\/g, "");
      }
      const [rows] = await pool.query(
        "SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1",
        [catName]
      );
      return wrapCategory(rows[0]);
    }
    if (query._id) {
      const [rows] = await pool.query(
        "SELECT * FROM categories WHERE _id = ? LIMIT 1",
        [query._id]
      );
      return wrapCategory(rows[0]);
    }
    const [rows] = await pool.query("SELECT * FROM categories LIMIT 1");
    return wrapCategory(rows[0]);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE _id = ? LIMIT 1",
      [id]
    );
    return wrapCategory(rows[0]);
  }

  static async create(data) {
    const _id = data._id || crypto.randomBytes(12).toString("hex");
    await pool.query(
      "INSERT INTO categories (_id, name, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      [_id, data.name]
    );
    return wrapCategory({ _id, name: data.name });
  }
}
