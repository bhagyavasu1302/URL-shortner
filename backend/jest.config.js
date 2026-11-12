export default {
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.test.js"],
  setupFiles: ["<rootDir>/test/setupEnv.js"],
  transform: {},
  clearMocks: true,
};
