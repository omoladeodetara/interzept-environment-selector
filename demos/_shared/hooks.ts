"use client";

import { useState, useEffect, useCallback } from 'react';
import { lastPriceClient, AssignmentResult } from './lastprice-client';

/**
 * Hook to get a user's assigned price variant
 * Automatically handles assignment on mount
 */
export function usePriceVariant(
  experimentId: string,
  userId?: string
) {
  const [assignment, setAssignment] = useState<AssignmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!experimentId || !userId) {
      setLoading(false);
      return;
    }

    async function fetchVariant() {
      try {
        setLoading(true);
        const result = await lastPriceClient.assignVariant(userId!, experimentId);
        setAssignment(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchVariant();
  }, [experimentId, userId]);

  const trackConversion = useCallback(
    async (revenue?: number) => {
      if (!userId || !experimentId) return;
      await lastPriceClient.trackConversion(userId, experimentId, { revenue });
    },
    [userId, experimentId]
  );

  return {
    variant: assignment?.variant,
    price: assignment?.price,
    loading,
    error,
    trackConversion,
  };
}

/**
 * Hook to generate or retrieve a persistent user ID
 * Uses localStorage for demo purposes
 */
export function useUserId(): string {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Check localStorage first
    let id = localStorage.getItem('lastprice_demo_user_id');
    
    if (!id) {
      // Generate a new ID
      id = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('lastprice_demo_user_id', id);
    }
    
    setUserId(id);
  }, []);

  return userId;
}

/**
 * Combined hook for pricing experiments
 * Handles user ID generation and variant assignment
 */
export function usePricingExperiment(experimentId: string) {
  const userId = useUserId();
  const { variant, price, loading, error, trackConversion } = usePriceVariant(
    experimentId,
    userId
  );

  return {
    userId,
    variant,
    price,
    loading,
    error,
    trackConversion,
  };
}
