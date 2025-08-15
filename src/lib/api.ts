import type { Flight, FlightQueryFilters } from '@/types';
import { Settings } from './env-manager';

export async function fetchFlights(filters: FlightQueryFilters): Promise<Flight[]> {
  const cleanFilters: Record<string, string> = {};
  for (const key in filters) {
    const value = (filters as any)[key];
    if (value !== null && value !== undefined) {
      cleanFilters[key] = String(value);
    }
  }

  const queryString = new URLSearchParams(cleanFilters).toString();
  const url = `${Settings.backendUrl}/flights?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch flight data');
  }

  return await response.json();
}
