import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "sheth",
    });

    console.log("✅ MongoDB Connected");
    console.log("Database Name:", mongoose.connection.db.databaseName);

    // Check if admin exists, if not, create default (same as checkAdmin.js)
    const defaultEmail = "officeshethpet@gmail.com";
    const defaultPassword = "Admin@098";
    
    const adminExists = await Admin.findOne({ email: defaultEmail });
    if (!adminExists) {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
      
      const newAdmin = new Admin({
        email: defaultEmail,
        password: hashedPassword
      });
      
      await newAdmin.save();
      console.log("✅ Default admin created!");
      console.log("   Email:", defaultEmail);
      console.log("   Password:", defaultPassword);
    } else {
      console.log("✅ Admin already exists, skipping creation");
    }

  } catch (error) {
    console.error("❌ Database Connection Error:");
    console.error(error);

    process.exit(1);
  }
};

export default connectDB;
