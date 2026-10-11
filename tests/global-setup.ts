import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * Runs once before the suite. Creates the dedicated test database if it does
 * not exist and applies the committed migrations to it. Migrations are used
 * (rather than `db push`) because they are non-destructive and therefore safe
 * to run against the test database without an interactive confirmation.
 */
export default function globalSetup() {
  loadEnv({ path: path.join(rootDir, ".env") });

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is not set");
  }
  if (testDatabaseUrl === process.env.DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL must differ from DATABASE_URL. Refusing to prepare the test database.",
    );
  }
  if (!/_test/.test(testDatabaseUrl)) {
    throw new Error(
      "TEST_DATABASE_URL must point to a database whose name contains '_test'.",
    );
  }

  execSync("npx prisma migrate deploy", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}
