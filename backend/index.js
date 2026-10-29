import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import connectDB from "./db/mongoose.js";
import adminRoutes from "./routes/adminRoute.js";
import productRouter from "./routes/productRoute.js";
import blogRouter from "./routes/blogRoute.js";
import careerRouter from "./routes/careerRoute.js";
import contactRouter from "./routes/contactRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

console.log("Starting application...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("✅ Created uploads directory");
}
app.use("/uploads", express.static(uploadsPath));

connectDB();

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/careers", careerRouter);
app.use("/api/contact", contactRouter);

app.use((error, req, res, next) => {
  console.error('\n❌ UNHANDLED ERROR ❌');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('❌ END OF ERROR ❌\n');
  res.status(500).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

app.get("/test", (req, res) => {
  res.json({ message: "Test route working! " });
});

const distPath = path.join(__dirname, "dist");
console.log("Dist Path:", distPath);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api\/|\/uploads\/|\/test).*/, (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ success: false, message: "Frontend not built. Run 'npm run build' in backend folder." });
    }
  });
} else {
  console.warn("⚠️  dist folder not found. Frontend will not be served. Run 'npm run build' to build the frontend.");
  app.get(/^(?!\/api\/|\/uploads\/|\/test).*/, (req, res) => {
    res.status(404).json({
      success: false,
      message: "Frontend dist folder not found. Run 'npm run build' in the backend folder to build and deploy.",
    });
  });
}

const PORT = process.env.PORT || 5000;

console.log("About to start server.");

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
