import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "sheth",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Connected successfully to database:", process.env.DB_NAME || "sheth");
    connection.release();

    // Check if default admin exists
    const [adminRows] = await pool.query("SELECT * FROM admins WHERE email = ? LIMIT 1", [
      "officeshethpet@gmail.com",
    ]);

    if (adminRows.length === 0) {
      const defaultPassword = "Admin@098";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await pool.query(
        "INSERT INTO admins (_id, email, password, createdAt, updatedAt) VALUES (HEX(RANDOM_BYTES(12)), ?, ?, NOW(), NOW())",
        ["officeshethpet@gmail.com", hashedPassword]
      );
      console.log("✅ Default admin created: officeshethpet@gmail.com");
    }
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error.message);
    process.exit(1);
  }
};

export default pool;
