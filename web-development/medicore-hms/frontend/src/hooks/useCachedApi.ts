import { useCallback, useEffect, useState } from 'react';
import { requestCache } from '../utils/requestCache';

interface UseCachedApiOptions<T> {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  cacheTTL?: number; // Time to live in milliseconds
  enabled?: boolean; // Whether to fetch on mount
}

interface UseCachedApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for API calls with caching support
 * Reduces redundant API calls by caching responses
 */
export function useCachedApi<T>({
  cacheKey,
  fetchFn,
  cacheTTL,
  enabled = true,
}: UseCachedApiOptions<T>): UseCachedApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = requestCache.get<T>(cacheKey, cacheTTL);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API
      const result = await fetchFn();
      
      // Cache the result
      requestCache.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, cacheTTL]);

  const clearCache = useCallback(() => {
    requestCache.clear(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearCache,
  };
}
