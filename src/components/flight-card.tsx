'use client';

import { useState, useEffect } from 'react';
import type { Flight } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import {
  PlaneTakeoff,
  PlaneLanding,
  Plane,
  Timer,
  Fuel,
  Mountain,
  CloudCog,
  Hash,
  RadioTower,
  ShieldQuestion,
} from 'lucide-react';

const DateTimeCell = ({ dateString, showTime = true }: { dateString: string; showTime?: boolean }) => {
  const [clientDate, setClientDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      try {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
        if (showTime) {
          options.hour = '2-digit';
          options.minute = '2-digit';
        }
        const date = new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
        setClientDate(date);
      } catch (e) {
        setClientDate('Invalid Date');
      }
    } else {
      setClientDate('N/A');
    }
  }, [dateString, showTime]);

  if (!clientDate) {
    return null;
  }

  return <>{clientDate}</>;
};

const formatSeconds = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return 'N/A';
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const DataRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | JSX.Element | null;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-sm text-right">{value ?? 'N/A'}</span>
  </div>
);

const PhaseData = ({ flight }: { flight: Flight }) => (
  <div className="grid grid-cols-2 gap-x-4">
    <div className="space-y-1">
      <h4 className="font-semibold text-sm mt-2 mb-1">Durations</h4>
      <DataRow icon={Timer} label="Takeoff" value={formatSeconds(flight.duration_takeoff_s)} />
      <DataRow icon={Timer} label="Climb" value={formatSeconds(flight.duration_climb_s)} />
      <DataRow icon={Timer} label="Cruise" value={formatSeconds(flight.duration_cruise_s)} />
      <DataRow icon={Timer} label="Descent" value={formatSeconds(flight.duration_descent_s)} />
      <DataRow icon={Timer} label="Landing" value={formatSeconds(flight.duration_landing_s)} />
    </div>
    <div className="space-y-1">
      <h4 className="font-semibold text-sm mt-2 mb-1">Fuel (kg)</h4>
      <DataRow icon={Fuel} label="Takeoff" value={flight.fuel_takeoff_kg?.toLocaleString() ?? 'N/A'} />
      <DataRow icon={Fuel} label="Climb" value={flight.fuel_climb_kg?.toLocaleString() ?? 'N/A'} />
      <DataRow icon={Fuel} label="Cruise" value={flight.fuel_cruise_kg?.toLocaleString() ?? 'N/A'} />
      <DataRow icon={Fuel} label="Descent" value={flight.fuel_descent_kg?.toLocaleString() ?? 'N/A'} />
      <DataRow icon={Fuel} label="Landing" value={flight.fuel_landing_kg?.toLocaleString() ?? 'N/A'} />
    </div>
    <div className="space-y-1 col-span-2">
      <h4 className="font-semibold text-sm mt-2 mb-1">CO₂ Emissions (kg)</h4>
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <DataRow icon={CloudCog} label="Takeoff" value={flight.co2_takeoff_kg?.toLocaleString() ?? 'N/A'} />
          <DataRow icon={CloudCog} label="Climb" value={flight.co2_climb_kg?.toLocaleString() ?? 'N/A'} />
          <DataRow icon={CloudCog} label="Cruise" value={flight.co2_cruise_kg?.toLocaleString() ?? 'N/A'} />
        </div>
        <div>
          <DataRow icon={CloudCog} label="Descent" value={flight.co2_descent_kg?.toLocaleString() ?? 'N/A'} />
          <DataRow icon={CloudCog} label="Landing" value={flight.co2_landing_kg?.toLocaleString() ?? 'N/A'} />
          <DataRow
            icon={CloudCog}
            label="Per Passenger"
            value={flight.co2_per_passenger_kg?.toLocaleString() ?? 'N/A'}
          />
        </div>
      </div>
    </div>
  </div>
);

export function FlightCard({ flight }: { flight: Flight }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center justify-between w-full space-x-2">
              <div className="flex flex-col items-start text-left w-1/3 truncate">
                <span className="font-bold text-lg text-primary truncate">{flight.flight ?? 'Unknown'}</span>
                <span className="text-sm text-muted-foreground truncate">{flight.aircraft_model ?? 'Unknown'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                  <DateTimeCell dateString={flight.created_at} showTime={false} />
                </div>
              </div>
              <div className="flex flex-col items-end text-right w-1/3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{flight.departure ?? 'N/A'}</span>
                  <PlaneTakeoff className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{flight.arrival ?? 'N/A'}</span>
                  <PlaneLanding className="h-4 w-4 text-red-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <div className="space-y-1">
              <DataRow icon={Hash} label="Flight ID" value={flight.flight_id ?? 'N/A'} />
              <DataRow icon={ShieldQuestion} label="FR24 ID" value={flight.fr24_id ?? 'N/A'} />
              <DataRow icon={RadioTower} label="Callsign" value={flight.callsign ?? 'N/A'} />
              <DataRow icon={Plane} label="Registration" value={flight.aircraft_reg ?? 'N/A'} />
              <DataRow icon={Mountain} label="Distance" value={`${flight.distance_km?.toLocaleString() ?? 'N/A'} km`} />
              <DataRow
                icon={Mountain}
                label="Circle Distance"
                value={`${flight.circle_distance?.toLocaleString() ?? 'N/A'} km`}
              />
              <DataRow
                icon={CloudCog}
                label="Total CO₂"
                value={`${flight.co2_total_kg?.toLocaleString() ?? 'N/A'} kg`}
              />
              <DataRow icon={Timer} label="Created At" value={<DateTimeCell dateString={flight.created_at} />} />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Phase Details</AccordionTrigger>
                  <AccordionContent>
                    <PhaseData flight={flight} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
