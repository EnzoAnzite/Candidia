import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: { NODE_ENV: 'test' },
    dotenv: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['routes/**', 'services/**', 'db/**', 'middleware/**'],
    }
  }
})