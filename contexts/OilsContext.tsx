'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OilData } from '@/lib/types';
import { getAllAvailableOils } from '@/lib/services/oils';

interface OilsContextType {
  oils: OilData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const OilsContext = createContext<OilsContextType | undefined>(undefined);

export function OilsProvider({ children }: { children: React.ReactNode }) {
  const [oils, setOils] = useState<OilData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOils = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllAvailableOils();
      setOils(data);
    } catch (err) {
      console.error('Failed to fetch oils:', err);
      setError(err instanceof Error ? err.message : 'Failed to load oils');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOils();
  }, []);

  return (
    <OilsContext.Provider value={{ oils, isLoading, error, refetch: fetchOils }}>
      {children}
    </OilsContext.Provider>
  );
}

export function useOils() {
  const context = useContext(OilsContext);
  if (context === undefined) {
    throw new Error('useOils must be used within an OilsProvider');
  }
  return context;
}
