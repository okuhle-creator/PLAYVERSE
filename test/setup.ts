import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Mock window.scrollTo for jsdom
  window.scrollTo = vi.fn();
});
