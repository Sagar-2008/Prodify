import "dotenv/config";
import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const schemaPath = fileURLToPath(new URL("../../../Database.sql", import.meta.url));
const schema = await readFile(schemaPath, "utf8");
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2" } : undefined,
  multipleStatements: true,
});

try {
  await connection.query(schema);
  console.log("Base database schema applied.");
} catch (error) {
  console.error("Base database migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
