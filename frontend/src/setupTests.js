import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './test/server'

// Mock ResizeObserver for Recharts
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    // Mock the observe method
  }
  unobserve() {
    // Mock the unobserve method
  }
  disconnect() {
    // Mock the disconnect method
  }
}

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())
