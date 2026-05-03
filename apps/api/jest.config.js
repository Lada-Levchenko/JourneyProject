export default {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/*.spec.ts"],
  setupFiles: ["<rootDir>/src/test/setup-e2e.ts"],
  testTimeout: 60000,
  maxWorkers: 1,
};
