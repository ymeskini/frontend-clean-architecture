import '@testing-library/jest-dom/vitest';


Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vitest.fn().mockImplementation(() => ({
    matchMedia: vitest.fn(),
    addEventListener: vitest.fn(),
    removeEventListener: vitest.fn(),
  })),
});
