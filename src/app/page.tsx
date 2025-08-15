'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Flight, FlightQueryFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import { FlightCard } from '@/components/flight-card';
import { MetricCard } from '@/components/metric-card';
import { useToast } from '@/hooks/use-toast';
import { Plane, Gauge, CloudCog, ArrowDownUp, Calendar as CalendarIcon, Search, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { fetchFlights } from '@/lib/api';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const FLIGHTS_PER_PAGE = 9;

export default function FlightDashboardPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const [searchFilter, setSearchFilter] = useState('');
  const [airportFilter, setAirportFilter] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const debouncedSearch = useDebounce(searchFilter, 800);
  const debouncedAirport = useDebounce(airportFilter, 800);
  const debouncedAircraft = useDebounce(aircraftFilter, 800);
  const debouncedDate = useDebounce(dateFilter, 800);

  const isInitialMount = useRef(true);
  const observer = useRef<IntersectionObserver>();

  const getFlights = useCallback(
    async (filters: FlightQueryFilters, isLoadMore: boolean) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchFlights(filters);

        if (data.length < FLIGHTS_PER_PAGE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setFlights((prev) => (isLoadMore ? [...prev, ...data] : data));
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch flight data. Please try again later.',
        });
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setPage(1);
    setFlights([]);
    setHasMore(true);

    const filters: FlightQueryFilters = {
      search: debouncedSearch || undefined,
      airport: debouncedAirport || undefined,
      aircraft_model: debouncedAircraft || undefined,
      flight_date: debouncedDate ? format(debouncedDate, 'yyyy-MM-dd') : undefined,
      limit: FLIGHTS_PER_PAGE,
      offset: 0,
    };

    if (debouncedSearch || debouncedAirport || debouncedAircraft || debouncedDate) {
      getFlights(filters, false);
    }
  }, [debouncedSearch, debouncedAirport, debouncedAircraft, debouncedDate, getFlights]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);

    const filters: FlightQueryFilters = {
      search: debouncedSearch || undefined,
      airport: debouncedAirport || undefined,
      aircraft_model: debouncedAircraft || undefined,
      flight_date: debouncedDate ? format(debouncedDate, 'yyyy-MM-dd') : undefined,
      limit: FLIGHTS_PER_PAGE,
      offset: (nextPage - 1) * FLIGHTS_PER_PAGE,
    };

    getFlights(filters, true);
  }, [page, debouncedSearch, debouncedAirport, debouncedAircraft, debouncedDate, getFlights]);

  const lastElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, handleLoadMore],
  );

  const metrics = useMemo(() => {
    const totalFlights = flights.length;
    if (totalFlights === 0) {
      return {
        avgDistance: 0,
        avgFuel: 0,
        avgCO2: 0,
        totalFlights: 0,
      };
    }

    const totals = flights.reduce(
      (acc, flight) => {
        acc.distance += flight.distance_calculated_km || 0;
        acc.fuel +=
          (flight.fuel_takeoff_kg || 0) +
          (flight.fuel_climb_kg || 0) +
          (flight.fuel_cruise_kg || 0) +
          (flight.fuel_descent_kg || 0) +
          (flight.fuel_landing_kg || 0);
        acc.co2 += flight.co2_total_kg || 0;
        return acc;
      },
      { distance: 0, fuel: 0, co2: 0 },
    );

    return {
      avgDistance: totals.distance / totalFlights,
      avgFuel: totals.fuel / totalFlights,
      avgCO2: totals.co2 / totalFlights,
      totalFlights: totalFlights,
    };
  }, [flights]);

  const hasActiveFilters = useMemo(() => {
    return !!(debouncedSearch || debouncedAirport || debouncedAircraft || debouncedDate);
  }, [debouncedSearch, debouncedAirport, debouncedAircraft, debouncedDate]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">FlightStats Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Flights Found"
            value={!hasActiveFilters ? '...' : metrics.totalFlights.toLocaleString()}
            icon={ArrowDownUp}
            description="Total flights matching filters"
          />
          <MetricCard
            title="Avg. Distance"
            value={!hasActiveFilters ? '...' : `${metrics.avgDistance.toFixed(0)} km`}
            icon={Plane}
            description="Average flight distance"
          />
          <MetricCard
            title="Avg. Fuel Consumption"
            value={!hasActiveFilters ? '...' : `${metrics.avgFuel.toFixed(0)} kg`}
            icon={Gauge}
            description="Average fuel used per flight"
          />
          <MetricCard
            title="Avg. CO2 Emissions"
            value={!hasActiveFilters ? '...' : `${metrics.avgCO2.toFixed(0)} kg`}
            icon={CloudCog}
            description="Average CO2 emissions per flight"
          />
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Search & Filter</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="search-filter">Search (Flight No., FR24 ID, Callsign)</Label>
                    <Input
                      id="search-filter"
                      placeholder="e.g., AAL123, 35a8157, UAL456"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="airport-filter">Filter by Airport (ICAO)</Label>
                      <Input
                        id="airport-filter"
                        placeholder="e.g., KJFK"
                        value={airportFilter}
                        onChange={(e) => setAirportFilter(e.target.value)}
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="aircraft-filter">Filter by Aircraft</Label>
                      <Input
                        id="aircraft-filter"
                        placeholder="e.g., Boeing 737"
                        value={aircraftFilter}
                        onChange={(e) => setAircraftFilter(e.target.value)}
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="date-filter">Filter by Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-filter"
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !dateFilter && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="md:columns-2 xl:columns-3 gap-4 space-y-4 pt-6">
            {loading &&
              Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
            {!loading &&
              flights.length > 0 &&
              flights.map((flight, index) => {
                if (flights.length === index + 1) {
                  return (
                    <div ref={lastElementRef} key={flight.fr24_id} className="break-inside-avoid">
                      <FlightCard flight={flight} />
                    </div>
                  );
                } else {
                  return (
                    <div key={flight.fr24_id} className="break-inside-avoid">
                      <FlightCard flight={flight} />
                    </div>
                  );
                }
              })}
            {!loading && flights.length === 0 && (
              <div className="col-span-full text-center py-12">
                {hasActiveFilters ? (
                  <p>No results found for your search.</p>
                ) : (
                  <p>Use the search and filters above to find flights.</p>
                )}
              </div>
            )}
          </div>
          {loadingMore && (
            <div className="flex justify-center mt-6">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
