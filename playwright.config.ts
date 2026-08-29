import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.pl\.(ts|tsx)/,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120000
  }
});
