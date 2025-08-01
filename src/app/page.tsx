'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Flight } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import { FlightCard } from '@/components/flight-card';
import { MetricCard } from '@/components/metric-card';
import { useToast } from '@/hooks/use-toast';
import { Plane, Gauge, CloudCog, ArrowDownUp, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { fetchFlights } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';

export default function FlightDashboardPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [airportFilter, setAirportFilter] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const debouncedAirportFilter = useDebounce(airportFilter, 1000);
  const debouncedAircraftFilter = useDebounce(aircraftFilter, 1000);

  useEffect(() => {
    const getFlights = async () => {
      try {
        setLoading(true);
        const data = await fetchFlights();
        setFlights(data);
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch flight data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };
    getFlights();
  }, [toast]);

  const processedFlights = useMemo(() => {
    let filteredFlights = [...flights];

    if (debouncedAirportFilter) {
      filteredFlights = filteredFlights.filter(
        (flight) =>
          flight.departure?.toLowerCase().includes(debouncedAirportFilter.toLowerCase()) ||
          flight.arrival?.toLowerCase().includes(debouncedAirportFilter.toLowerCase()),
      );
    }
    if (debouncedAircraftFilter) {
      filteredFlights = filteredFlights.filter((flight) =>
        flight.aircraft_model?.toLowerCase().includes(debouncedAircraftFilter.toLowerCase()),
      );
    }

    if (dateFilter) {
      filteredFlights = filteredFlights.filter((flight) => {
        if (!flight.created_at) return false;
        const flightDate = new Date(flight.created_at);
        return flightDate.toDateString() === dateFilter.toDateString();
      });
    }

    filteredFlights.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      if (isNaN(aDate) || isNaN(bDate)) return 0;
      return bDate - aDate;
    });

    return filteredFlights;
  }, [flights, debouncedAirportFilter, debouncedAircraftFilter, dateFilter]);

  const metrics = useMemo(() => {
    const totalFlights = processedFlights.length;
    if (totalFlights === 0) {
      return {
        avgDistance: 0,
        avgFuel: 0,
        avgCO2: 0,
        totalFlights: 0,
      };
    }

    const totals = processedFlights.reduce(
      (acc, flight) => {
        acc.distance += flight.distance_km || 0;
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
  }, [processedFlights]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline flex gap-3 items-center">
            <Image src="/icon.svg" width={42} height={42} alt="Flights logo" /> Flights Dashboard
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Flights"
            value={loading ? '...' : metrics.totalFlights.toLocaleString()}
            icon={ArrowDownUp}
            description="Total flights matching filters"
            loading={loading}
          />
          <MetricCard
            title="Avg. Distance"
            value={loading ? '...' : `${metrics.avgDistance.toFixed(0)} km`}
            icon={Plane}
            description="Average flight distance"
            loading={loading}
          />
          <MetricCard
            title="Avg. Fuel Consumption"
            value={loading ? '...' : `${metrics.avgFuel.toFixed(0)} kg`}
            icon={Gauge}
            description="Average fuel used per flight"
            loading={loading}
          />
          <MetricCard
            title="Avg. CO2 Emissions"
            value={loading ? '...' : `${metrics.avgCO2.toFixed(0)} kg`}
            icon={CloudCog}
            description="Average CO2 emissions per flight"
            loading={loading}
          />
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Filters</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-3 gap-4 pt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="airport-filter">Filter by Airport</Label>
                    <Input
                      id="airport-filter"
                      placeholder="Departure or Arrival (e.g., JFK)"
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="md:columns-2 xl:columns-3 gap-4 space-y-4 pt-6">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)
            ) : processedFlights.length > 0 ? (
              processedFlights.map((flight) => (
                <div key={flight.fr24_id} className="break-inside-avoid">
                  <FlightCard flight={flight} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p>No results found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
