import { v2 as cloudinary } from "cloudinary";
import pool from "./db/mysql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  console.log("🚀 Starting Cloudinary image synchronization...");

  const [products] = await pool.query("SELECT _id, name, images, image FROM products");
  console.log(`Found ${products.length} products in database.`);

  const urlCache = new Map();

  // First, upload a default fallback image
  let defaultFallbackUrl = "https://res.cloudinary.com/p2ccdclk/image/upload/v1793372994/sheth-pet/products/1785736248849-19mm_-_20ml_Tulip_Clear.jpg";

  let uploadedCount = 0;
  let updatedProducts = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let images = typeof p.images === "string" ? JSON.parse(p.images || "{}") : (p.images || {});
    let hasChanges = false;

    // Process each color image
    for (const [color, imgVal] of Object.entries(images)) {
      if (typeof imgVal === "string" && !imgVal.startsWith("http")) {
        // Local filename
        if (urlCache.has(imgVal)) {
          images[color] = urlCache.get(imgVal);
          hasChanges = true;
          continue;
        }

        const localPath = path.join(__dirname, "uploads", imgVal);
        if (fs.existsSync(localPath)) {
          try {
            console.log(`[Upload] Uploading ${imgVal} to Cloudinary...`);
            const res = await cloudinary.uploader.upload(localPath, {
              folder: "sheth-pet/products",
              use_filename: true,
              unique_filename: false,
              overwrite: true,
              resource_type: "image",
            });
            const cloudUrl = res.secure_url;
            urlCache.set(imgVal, cloudUrl);
            images[color] = cloudUrl;
            hasChanges = true;
            uploadedCount++;
            console.log(`✅ Uploaded (${uploadedCount}): ${cloudUrl}`);
          } catch (err) {
            console.warn(`⚠️ Failed to upload ${imgVal}: ${err.message}`);
          }
        } else {
          // File does not exist locally (e.g. 1786979804342.jpg)
          console.log(`⚠️ Missing local file for ${p.name} [${color}]: ${imgVal} -> using Cloudinary fallback`);
          images[color] = defaultFallbackUrl;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await pool.query("UPDATE products SET images = ? WHERE _id = ?", [
        JSON.stringify(images),
        p._id,
      ]);
      updatedProducts++;
    }
  }

  console.log(`\n🎉 Synchronization complete!`);
  console.log(`   - Images uploaded to Cloudinary: ${uploadedCount}`);
  console.log(`   - Products updated with Cloudinary URLs: ${updatedProducts}`);

  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Sync Error:", err);
  process.exit(1);
});
