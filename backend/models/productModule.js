import pool from "../db/mysql.js";
import Counter from "./counterModel.js";
import crypto from "crypto";

const parseJson = (val, defaultVal) => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
};

const wrapProduct = (row) => {
  if (!row) return null;
  return {
    ...row,
    color: parseJson(row.color, []),
    moqPackaging: parseJson(row.moqPackaging, {}),
    images: parseJson(row.images, {}),
    marketSegments: parseJson(row.marketSegments, []),
    neckProfile: parseJson(row.neckProfile, []),
    colorSpecs: parseJson(row.colorSpecs, {}),
    showInPopup: Boolean(row.showInPopup),
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

export default class Product {
  static find(query = {}, projection = null) {
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (query.category) {
      if (typeof query.category === "object" && query.category.$not) {
        sql += " AND LOWER(category) != LOWER('Containers')";
      } else if (typeof query.category === "object" && query.category.$regex) {
        const catStr = String(query.category.$regex)
          .replace(/^\^|\$$/g, "")
          .replace(/\\/g, "");
        sql += " AND LOWER(category) = LOWER(?)";
        params.push(catStr);
      } else {
        sql += " AND LOWER(category) = LOWER(?)";
        params.push(query.category);
      }
    }

    if (query.sku) {
      sql += " AND sku = ?";
      params.push(query.sku);
    }

    sql += " ORDER BY createdAt DESC";

    const execQuery = async () => {
      const [rows] = await pool.query(sql, params);
      return rows.map(wrapProduct);
    };

    return new QueryCursor(execQuery());
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM products WHERE _id = ? LIMIT 1", [id]);
    return wrapProduct(rows[0]);
  }

  static async findOne(query = {}) {
    if (query.sku) {
      const [rows] = await pool.query("SELECT * FROM products WHERE sku = ? LIMIT 1", [query.sku]);
      return wrapProduct(rows[0]);
    }
    if (query._id) {
      return this.findById(query._id);
    }
    const [rows] = await pool.query("SELECT * FROM products LIMIT 1");
    return wrapProduct(rows[0]);
  }

  static async create(data) {
    const _id = data._id || crypto.randomBytes(12).toString("hex");

    let sku = data.sku;
    if (!sku) {
      const counter = await Counter.findOneAndUpdate(
        { name: "productSku" },
        { $inc: { sequence: 1 } },
        { upsert: true }
      );
      sku = `SKU-${String(counter.sequence).padStart(4, "0")}`;
    }

    const color = JSON.stringify(Array.isArray(data.color) ? data.color : []);
    const moqPackaging = JSON.stringify(data.moqPackaging && typeof data.moqPackaging === "object" ? data.moqPackaging : {});
    const images = JSON.stringify(data.images && typeof data.images === "object" ? data.images : {});
    const marketSegments = JSON.stringify(Array.isArray(data.marketSegments) ? data.marketSegments : []);
    const neckProfile = JSON.stringify(Array.isArray(data.neckProfile) ? data.neckProfile : []);
    const colorSpecs = JSON.stringify(data.colorSpecs && typeof data.colorSpecs === "object" ? data.colorSpecs : {});
    const showInPopup = data.showInPopup ? 1 : 0;

    const query = `
      INSERT INTO products (
        _id, name, sku, category, productType, color, moqPackaging,
        capType, \`usage\`, keySpecs, image, images, showInPopup,
        marketSegments, volume, neckSize, weight, neckProfile,
        ofc, height, diameter, pilfer, length, colorSpecs,
        createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        NOW(), NOW()
      )
    `;

    const values = [
      _id,
      data.name,
      sku,
      data.category,
      data.productType || "",
      color,
      moqPackaging,
      data.capType || "individual",
      data.usage || "",
      data.keySpecs || "",
      data.image || null,
      images,
      showInPopup,
      marketSegments,
      data.volume || "",
      data.neckSize || "",
      data.weight || "",
      neckProfile,
      data.ofc || "",
      data.height || "",
      data.diameter || "",
      data.pilfer || "",
      data.length || "",
      colorSpecs,
    ];

    await pool.query(query, values);
    return this.findById(_id);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const fields = [];
    const values = [];

    const stringFields = [
      "name",
      "sku",
      "category",
      "productType",
      "capType",
      "usage",
      "keySpecs",
      "image",
      "volume",
      "neckSize",
      "weight",
      "ofc",
      "height",
      "diameter",
      "pilfer",
      "length",
    ];

    for (const key of stringFields) {
      if (updateData[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        values.push(updateData[key]);
      }
    }

    if (updateData.showInPopup !== undefined) {
      fields.push("`showInPopup` = ?");
      values.push(updateData.showInPopup ? 1 : 0);
    }

    const jsonFields = ["color", "moqPackaging", "images", "marketSegments", "neckProfile", "colorSpecs"];
    for (const key of jsonFields) {
      if (updateData[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        values.push(JSON.stringify(updateData[key]));
      }
    }

    if (fields.length > 0) {
      fields.push("`updatedAt` = NOW()");
      values.push(id);
      const sql = `UPDATE products SET ${fields.join(", ")} WHERE _id = ?`;
      await pool.query(sql, values);
    }

    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.query("DELETE FROM products WHERE _id = ?", [id]);
    return existing;
  }
}
