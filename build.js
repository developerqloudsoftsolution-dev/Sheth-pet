import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distIndex = path.join(rootDir, "backend", "dist", "index.html");

console.log("🚀 Starting build process...");

// Step 1: Install backend dependencies
console.log("📦 Installing backend dependencies...");
try {
  execSync("npm --prefix backend install --omit=dev", { stdio: "inherit", cwd: rootDir });
} catch (err) {
  console.warn("⚠️ Standard backend install failed, retrying without flags...");
  execSync("npm --prefix backend install", { stdio: "inherit", cwd: rootDir });
}

// Step 2: Check if dist already exists
if (fs.existsSync(distIndex) && process.env.FORCE_BUILD !== "true") {
  console.log("✅ backend/dist already built and verified! Skipping frontend build.");
  process.exit(0);
}

// Step 3: Build frontend using node directly to avoid Linux permission issues
console.log("🔨 Building frontend with Vite...");
try {
  execSync("npm --prefix client install", { stdio: "inherit", cwd: rootDir });
  const viteBin = path.join(rootDir, "client", "node_modules", "vite", "bin", "vite.js");
  if (fs.existsSync(viteBin)) {
    execSync(`node "${viteBin}" build`, {
      stdio: "inherit",
      cwd: path.join(rootDir, "client"),
    });
  } else {
    execSync("npm --prefix client run build", { stdio: "inherit", cwd: rootDir });
  }
  console.log("✅ Frontend built successfully!");
} catch (error) {
  console.error("❌ Frontend build error:", error.message);
  if (fs.existsSync(distIndex)) {
    console.warn("⚠️ Falling back to existing backend/dist directory.");
    process.exit(0);
  }
  process.exit(1);
}
