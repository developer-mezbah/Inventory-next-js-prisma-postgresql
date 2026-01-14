"use client"
import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache
const cache = new Map();
const getFromCache = (key) => cache.get(key);
const setToCache = (key, data) => cache.set(key, data);

export const useFetchData = (url, queryKey) => {
  const cacheKey = queryKey.join('-');

  // --- State Management ---
  const initialData = getFromCache(cacheKey) || [];
  
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  
  // Start in initial loading state only if NO data is available (i.e., not in cache)
  const [isInitialLoading, setIsInitialLoading] = useState(initialData.length === 0);
  
  // isFetching is the background indicator
  const [isFetching, setIsFetching] = useState(false); 

  // --- Core Fetch Logic ---
  // IMPORTANT: We only depend on `url` and `cacheKey` to avoid the loop.
  const fetchData = useCallback(async () => {
    
    // Use the functional update form for state changes to avoid
    // needing `data` and `isInitialLoading` in the dependency array.

    let shouldFetch = true;
    
    // Check if we are currently "initial loading" AND we have cached data.
    // If so, we skip the fetch.
    if (isInitialLoading) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData && cachedData.length > 0) {
            setData(cachedData);
            setIsInitialLoading(false);
            shouldFetch = false;
        }
    }
    
    if (!shouldFetch) return;


    // Set Loading States based on whether data is already present
    // We check the current `data` value directly since this is run inside the loop-causing useEffect.
    // We use functional updates to update `isFetching` and `isInitialLoading`
    
    // Determine if this is an initial load (blocking) or a background re-fetch (non-blocking)
    const hasExistingData = getFromCache(cacheKey) && getFromCache(cacheKey).length > 0;
    
    if (!hasExistingData) {
        setIsInitialLoading(true);
    } else {
        setIsFetching(true); 
    }
    setError(null);


    try {
      const response = await fetch(url); 

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update state and cache
      setData(result);
      setToCache(cacheKey, result);
      setError(null);

    } catch (err) {
      setError(err);
      // Only clear data on error if no existing data was available
      if (!hasExistingData) {
          setData([]); 
      }
    } finally {
      // Always turn off the loading indicators
      setIsInitialLoading(false);
      setIsFetching(false);
    }
  }, [url, cacheKey]); // ONLY DEPEND ON CONSTANTS (url and cacheKey)


  // --- Effects and Exposed Functions ---
  
  // Effect to run the fetch function on mount or URL/Key changes
  useEffect(() => {
    // This runs only when fetchData changes, which is only when url or queryKey changes
    fetchData();
  }, [fetchData]);
  
  // Refetch function exposed to the user
  const refetch = useCallback(() => {
    // Force a fetch without relying on the internal state checks
    // We bypass the initial loading logic here and go straight to fetching
    const forceFetch = async () => {
        // Assume we have data, so we set isFetching for a non-blocking UI update
        // We set it manually here to ensure it flips
        setIsFetching(true); 
        setError(null);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            setToCache(cacheKey, result);
            setError(null);
        } catch (err) {
            setError(err);
            // We do NOT clear data on error during a refetch unless we want to
        } finally {
            setIsFetching(false);
        }
    };
    forceFetch();
  }, [url, cacheKey]); // DEPEND ONLY ON CONSTANTS

  return {
    isInitialLoading, // True only on first mount until data is available
    isFetching,       // True for background refreshes (including manual refetch)
    error,
    data,
    refetch,
  };
};