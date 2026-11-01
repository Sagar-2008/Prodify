import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { db } from "../config/db.js";

const migrationPaths = ["./001_productivity.sql", "./002_productivity_profile.sql"]
  .map((path) => fileURLToPath(new URL(path, import.meta.url)));

try {
  let statementCount = 0;
  for (const migrationPath of migrationPaths) {
    const migration = await readFile(migrationPath, "utf8");
    const statements = migration.split(";").map((statement) => statement.trim()).filter(Boolean);
    for (const statement of statements) await db.query(statement);
    statementCount += statements.length;
  }
  console.log(`Productivity database migrations applied (${statementCount} statements).`);
} catch (error) {
  console.error("Productivity database migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
