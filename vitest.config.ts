import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const fileEnv = loadEnv({ path: path.join(rootDir, ".env") }).parsed ?? {};

const testDatabaseUrl = process.env.TEST_DATABASE_URL || fileEnv.TEST_DATABASE_URL;
const devDatabaseUrl = process.env.DATABASE_URL || fileEnv.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is not set. Add it to .env before running the test suite.",
  );
}
if (testDatabaseUrl === devDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL must differ from DATABASE_URL. Refusing to run tests against the development database.",
  );
}
if (!/_test/.test(testDatabaseUrl)) {
  throw new Error(
    "TEST_DATABASE_URL must point to a database whose name contains '_test'. Refusing to run tests.",
  );
}

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    env: {
      // The Prisma singleton in app/api/prisma.ts reads DATABASE_URL at import
      // time. Point it at the dedicated test database for every test worker so
      // the development database can never be touched.
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
    },
    sequence: {
      concurrent: false,
    },
  },
});
