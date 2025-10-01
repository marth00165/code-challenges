import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFares } from '../hooks/useFares';

const mockFaresJson = {
  zones: [
    {
      zone: 1,
      name: 'CCP/1',
      fares: [
        {
          type: 'weekday',
          purchase: 'advance_purchase',
          trips: 1,
          price: 4.75,
        },
      ],
    },
  ],
  info: {
    weekday: 'Valid Monday through Friday',
  },
};

describe('useFares', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset fetch mock
    globalThis.fetch = vi.fn();
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useFares());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should successfully fetch fares', async () => {
    // Mock successful fetch
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFaresJson),
    });

    const { result } = renderHook(() => useFares());

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockFaresJson);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/fares.json');
  });

  it('should handle HTTP errors', async () => {
    // Mock failed fetch with HTTP error
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useFares());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('HTTP 404');
  });

  it('should handle network errors', async () => {
    // Mock network failure
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFares());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should only fetch once', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFaresJson),
    });

    const { result } = renderHook(() => useFares());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
