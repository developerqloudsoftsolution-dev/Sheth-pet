import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, 'db_backup');
const outputDir = path.join(__dirname, 'mysql_backup');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const jsonStr = JSON.stringify(value);
    return `'${jsonStr.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
  }
  const str = String(value);
  return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

function formatDate(isoStr) {
  if (!isoStr) return 'NULL';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'NULL';
    return `'${d.toISOString().slice(0, 19).replace('T', ' ')}'`;
  } catch {
    return 'NULL';
  }
}

let sql = `-- Sheth PET MySQL Database Dump
-- Converted from MongoDB
-- Database: \`sheth\`

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE IF NOT EXISTS \`sheth\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`sheth\`;

-- --------------------------------------------------------
-- Table structure for \`admins\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`admins\`;
CREATE TABLE \`admins\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`otp\` VARCHAR(50) DEFAULT NULL,
  \`otpExpiry\` DATETIME DEFAULT NULL,
  \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`categories\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`products\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`sku\` VARCHAR(100) DEFAULT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`productType\` VARCHAR(100) DEFAULT NULL,
  \`color\` JSON DEFAULT NULL,
  \`moqPackaging\` JSON DEFAULT NULL,
  \`capType\` VARCHAR(100) DEFAULT NULL,
  \`usage\` TEXT DEFAULT NULL,
  \`keySpecs\` TEXT DEFAULT NULL,
  \`image\` VARCHAR(500) DEFAULT NULL,
  \`images\` JSON DEFAULT NULL,
  \`showInPopup\` TINYINT(1) DEFAULT 0,
  \`marketSegments\` JSON DEFAULT NULL,
  \`volume\` VARCHAR(100) DEFAULT NULL,
  \`neckSize\` VARCHAR(100) DEFAULT NULL,
  \`weight\` VARCHAR(100) DEFAULT NULL,
  \`neckProfile\` JSON DEFAULT NULL,
  \`ofc\` VARCHAR(100) DEFAULT NULL,
  \`height\` VARCHAR(100) DEFAULT NULL,
  \`diameter\` VARCHAR(100) DEFAULT NULL,
  \`pilfer\` VARCHAR(100) DEFAULT NULL,
  \`length\` VARCHAR(100) DEFAULT NULL,
  \`colorSpecs\` JSON DEFAULT NULL,
  \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`_id\`),
  KEY \`idx_category\` (\`category\`),
  KEY \`idx_sku\` (\`sku\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`blogs\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`blogs\`;
CREATE TABLE \`blogs\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,
  \`description\` TEXT DEFAULT NULL,
  \`content\` LONGTEXT DEFAULT NULL,
  \`image\` VARCHAR(500) DEFAULT NULL,
  \`author\` VARCHAR(100) DEFAULT 'Admin',
  \`tags\` JSON DEFAULT NULL,
  \`isPublished\` TINYINT(1) DEFAULT 1,
  \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`careers\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`careers\`;
CREATE TABLE \`careers\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`postName\` VARCHAR(255) NOT NULL,
  \`location\` VARCHAR(255) DEFAULT NULL,
  \`employmentType\` VARCHAR(100) DEFAULT NULL,
  \`experience\` VARCHAR(100) DEFAULT NULL,
  \`education\` VARCHAR(100) DEFAULT NULL,
  \`salary\` VARCHAR(100) DEFAULT NULL,
  \`isActive\` TINYINT(1) DEFAULT 1,
  \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for \`counters\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`counters\`;
CREATE TABLE \`counters\` (
  \`_id\` VARCHAR(32) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`sequence\` INT DEFAULT 0,
  PRIMARY KEY (\`_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// Insert Admins
const admins = JSON.parse(fs.readFileSync(path.join(backupDir, 'admins.json'), 'utf-8'));
if (admins.length > 0) {
  sql += `-- Dumping data for table \`admins\`\n`;
  for (const a of admins) {
    sql += `INSERT INTO \`admins\` (\`_id\`, \`email\`, \`password\`, \`otp\`, \`otpExpiry\`, \`createdAt\`, \`updatedAt\`) VALUES (${escapeSql(a._id)}, ${escapeSql(a.email)}, ${escapeSql(a.password)}, ${escapeSql(a.otp)}, ${formatDate(a.otpExpiry)}, ${formatDate(a.createdAt)}, ${formatDate(a.updatedAt)});\n`;
  }
  sql += '\n';
}

// Insert Categories
const categories = JSON.parse(fs.readFileSync(path.join(backupDir, 'categories.json'), 'utf-8'));
if (categories.length > 0) {
  sql += `-- Dumping data for table \`categories\`\n`;
  for (const c of categories) {
    sql += `INSERT INTO \`categories\` (\`_id\`, \`name\`, \`createdAt\`, \`updatedAt\`) VALUES (${escapeSql(c._id)}, ${escapeSql(c.name)}, ${formatDate(c.createdAt)}, ${formatDate(c.updatedAt)});\n`;
  }
  sql += '\n';
}

// Insert Products
const products = JSON.parse(fs.readFileSync(path.join(backupDir, 'products.json'), 'utf-8'));
if (products.length > 0) {
  sql += `-- Dumping data for table \`products\`\n`;
  for (const p of products) {
    sql += `INSERT INTO \`products\` (
  \`_id\`, \`name\`, \`sku\`, \`category\`, \`productType\`, \`color\`, \`moqPackaging\`,
  \`capType\`, \`usage\`, \`keySpecs\`, \`image\`, \`images\`, \`showInPopup\`,
  \`marketSegments\`, \`volume\`, \`neckSize\`, \`weight\`, \`neckProfile\`,
  \`ofc\`, \`height\`, \`diameter\`, \`pilfer\`, \`length\`, \`colorSpecs\`,
  \`createdAt\`, \`updatedAt\`
) VALUES (
  ${escapeSql(p._id)},
  ${escapeSql(p.name)},
  ${escapeSql(p.sku)},
  ${escapeSql(p.category)},
  ${escapeSql(p.productType || '')},
  ${escapeSql(p.color || [])},
  ${escapeSql(p.moqPackaging || {})},
  ${escapeSql(p.capType || '')},
  ${escapeSql(p.usage || '')},
  ${escapeSql(p.keySpecs || '')},
  ${escapeSql(p.image || null)},
  ${escapeSql(p.images || {})},
  ${p.showInPopup ? 1 : 0},
  ${escapeSql(p.marketSegments || [])},
  ${escapeSql(p.volume || '')},
  ${escapeSql(p.neckSize || '')},
  ${escapeSql(p.weight || '')},
  ${escapeSql(p.neckProfile || [])},
  ${escapeSql(p.ofc || '')},
  ${escapeSql(p.height || '')},
  ${escapeSql(p.diameter || '')},
  ${escapeSql(p.pilfer || '')},
  ${escapeSql(p.length || '')},
  ${escapeSql(p.colorSpecs || {})},
  ${formatDate(p.createdAt)},
  ${formatDate(p.updatedAt)}
);\n`;
  }
  sql += '\n';
}

// Insert Blogs
const blogs = JSON.parse(fs.readFileSync(path.join(backupDir, 'blogs.json'), 'utf-8'));
if (blogs.length > 0) {
  sql += `-- Dumping data for table \`blogs\`\n`;
  for (const b of blogs) {
    sql += `INSERT INTO \`blogs\` (\`_id\`, \`title\`, \`slug\`, \`description\`, \`content\`, \`image\`, \`author\`, \`tags\`, \`isPublished\`, \`createdAt\`, \`updatedAt\`) VALUES (${escapeSql(b._id)}, ${escapeSql(b.title)}, ${escapeSql(b.slug)}, ${escapeSql(b.description)}, ${escapeSql(b.content)}, ${escapeSql(b.image)}, ${escapeSql(b.author || 'Admin')}, ${escapeSql(b.tags || [])}, ${b.isPublished === false ? 0 : 1}, ${formatDate(b.createdAt)}, ${formatDate(b.updatedAt)});\n`;
  }
  sql += '\n';
}

// Insert Careers
const careers = JSON.parse(fs.readFileSync(path.join(backupDir, 'careers.json'), 'utf-8'));
if (careers.length > 0) {
  sql += `-- Dumping data for table \`careers\`\n`;
  for (const cr of careers) {
    sql += `INSERT INTO \`careers\` (\`_id\`, \`postName\`, \`location\`, \`employmentType\`, \`experience\`, \`education\`, \`salary\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES (${escapeSql(cr._id)}, ${escapeSql(cr.postName)}, ${escapeSql(cr.location)}, ${escapeSql(cr.employmentType)}, ${escapeSql(cr.experience)}, ${escapeSql(cr.education)}, ${escapeSql(cr.salary)}, ${cr.isActive === false ? 0 : 1}, ${formatDate(cr.createdAt)}, ${formatDate(cr.updatedAt)});\n`;
  }
  sql += '\n';
}

// Insert Counters
const counters = JSON.parse(fs.readFileSync(path.join(backupDir, 'counters.json'), 'utf-8'));
if (counters.length > 0) {
  sql += `-- Dumping data for table \`counters\`\n`;
  for (const cnt of counters) {
    sql += `INSERT INTO \`counters\` (\`_id\`, \`name\`, \`sequence\`) VALUES (${escapeSql(cnt._id)}, ${escapeSql(cnt.name)}, ${cnt.sequence || 0});\n`;
  }
  sql += '\n';
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

const sqlFilePath = path.join(outputDir, 'sheth.sql');
fs.writeFileSync(sqlFilePath, sql, 'utf-8');
console.log(`✅ Generated SQL file: ${sqlFilePath}`);
console.log(`   - Admins: ${admins.length}`);
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Products: ${products.length}`);
console.log(`   - Blogs: ${blogs.length}`);
console.log(`   - Careers: ${careers.length}`);
console.log(`   - Counters: ${counters.length}`);

