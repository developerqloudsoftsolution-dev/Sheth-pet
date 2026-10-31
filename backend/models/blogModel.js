import pool from "../db/mysql.js";
import crypto from "crypto";

const parseJsonField = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
};

const wrapBlog = (row) => {
  if (!row) return null;
  const blog = {
    ...row,
    tags: parseJsonField(row.tags, []),
    isPublished: Boolean(row.isPublished),
    toObject() {
      return { ...this };
    },
  };
  return blog;
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

export default class Blog {
  static find(query = {}) {
    let sql = "SELECT * FROM blogs ORDER BY createdAt DESC";
    const exec = async () => {
      const [rows] = await pool.query(sql);
      return rows.map(wrapBlog);
    };
    return new QueryCursor(exec());
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM blogs WHERE _id = ? LIMIT 1", [id]);
    return wrapBlog(rows[0]);
  }

  static async findOne(query = {}) {
    if (query.slug) {
      const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ? LIMIT 1", [query.slug]);
      return wrapBlog(rows[0]);
    }
    if (query._id) {
      return this.findById(query._id);
    }
    const [rows] = await pool.query("SELECT * FROM blogs LIMIT 1");
    return wrapBlog(rows[0]);
  }

  static async create(data) {
    const _id = data._id || crypto.randomBytes(12).toString("hex");
    const tagsJson = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
    const isPublished = data.isPublished ? 1 : 0;

    await pool.query(
      `INSERT INTO blogs (_id, title, slug, description, content, image, author, tags, isPublished, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        _id,
        data.title,
        data.slug,
        data.description || "",
        data.content || "",
        data.image || null,
        data.author || "Admin",
        tagsJson,
        isPublished,
      ]
    );

    return this.findById(_id);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const fields = [];
    const values = [];

    const allowed = ["title", "slug", "description", "content", "image", "author"];
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        values.push(updateData[key]);
      }
    }

    if (updateData.tags !== undefined) {
      fields.push("`tags` = ?");
      values.push(JSON.stringify(Array.isArray(updateData.tags) ? updateData.tags : []));
    }

    if (updateData.isPublished !== undefined) {
      fields.push("`isPublished` = ?");
      values.push(updateData.isPublished ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push("`updatedAt` = NOW()");
      values.push(id);
      const sql = `UPDATE blogs SET ${fields.join(", ")} WHERE _id = ?`;
      await pool.query(sql, values);
    }

    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.query("DELETE FROM blogs WHERE _id = ?", [id]);
    return existing;
  }
}
