import {
  PlaywrightTestConfig,
  PlaywrightTestProject,
  defineConfig,
  devices,
} from "@playwright/test";
import * as dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const playwrightConfig = {
  testDir: "./OperacaoEmpresas/tests",
  timeout: 5 * 60 * 1500,
  expect: {
    timeout: 60000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 2 * 60 * 1000,
    headless: false,
    launchOptions: {
      slowMo: 400,
    },

    video: "on",
    screenshot: "on",
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  globalSetup: "setup/globalSetup.ts",

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup-chrome",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup-chrome"],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
} satisfies PlaywrightTestConfig;

// Configuração da baseUrl pelo environment setado no terminal, é executado antes do globalSetup
if (process.env.env) {
  const { parsed, error } = dotenv.configDotenv({
    path: `setup/.env.${process.env.env}`,
  });

  if (error || !parsed) {
    throw error;
  }

  for (const project of playwrightConfig.projects) {
    (project.use as PlaywrightTestProject["use"]) = {
      ...project.use,
      baseURL: parsed.BASE_URL,
    };
  }
}

export default defineConfig(playwrightConfig);
