
"use client";

import { useState, useEffect } from "react";
import type { Flight } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { PlaneTakeoff, PlaneLanding, Plane, Timer, Fuel, Mountain, CloudCog, Hash, RadioTower, ShieldQuestion, CalendarClock, ArrowDown, ArrowUp } from "lucide-react";

const DateTimeCell = ({ dateString, showTime = true }: { dateString?: string, showTime?: boolean }) => {
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
          options.timeZone = 'UTC';
          options.timeZoneName = 'short';
        }
        const date = new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
        setClientDate(date);
      } catch (e) {
        setClientDate("Invalid Date");
      }
    } else {
      setClientDate("N/A");
    }
  }, [dateString, showTime]);

  if (clientDate === null) {
    return null;
  }

  return <>{clientDate}</>;
};

const formatSeconds = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return 'N/A';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const DataRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | JSX.Element | null }) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-sm text-right">{value ?? 'N/A'}</span>
  </div>
);

const EmissionComparisonCard = ({ flight }: { flight: Flight }) => {
  const detailed = flight.emission_comparison.detailed_calculation;
  const statistical = flight.emission_comparison.statistical_simulation;

  const co2Diff = (detailed.co2_per_passenger_kg ?? 0) - (statistical.co2_per_passenger_kg ?? 0);
  const co2Percentage = (statistical.co2_per_passenger_kg && statistical.co2_per_passenger_kg !== 0)
    ? (co2Diff / statistical.co2_per_passenger_kg) * 100
    : 0;
  const isCo2Better = co2Diff < 0;

  const ComparisonRow = ({ label, detailedValue, statisticalValue, unit, smallerIsBetter = true, precision = 2 }: { label: string, detailedValue?: number, statisticalValue?: number, unit: string, smallerIsBetter?: boolean, precision?: number }) => {
    const diff = (detailedValue ?? 0) - (statisticalValue ?? 0);
    const percentage = (statisticalValue && statisticalValue !== 0) ? (diff / statisticalValue) * 100 : 0;
    const isBetter = smallerIsBetter ? diff < 0 : diff > 0;

    return (
      <div className="flex items-center justify-between text-sm py-2 border-t">
        <div className="w-1/4 font-medium text-muted-foreground">{label}</div>
        <div className="w-1/4 text-center font-semibold text-primary">{detailedValue?.toFixed(precision) ?? 'N/A'} {unit}</div>
        <div className="w-1/4 text-center">{statisticalValue?.toFixed(precision) ?? 'N/A'} {unit}</div>
        <div className={`w-1/4 text-center font-bold flex items-center justify-center ${isBetter ? 'text-green-500' : 'text-red-500'}`}>
          {isBetter ? <ArrowDown className="h-4 w-4 mr-1" /> : <ArrowUp className="h-4 w-4 mr-1" />}
          {Math.abs(percentage).toFixed(1)}%
        </div>
      </div>
    )
  };

  return (
    <div className="border bg-card-foreground/5 rounded-lg p-4 my-4">
      <h4 className="font-bold text-center mb-3 text-base">CO₂ Emission Comparison (per Passenger)</h4>
      <div className="flex justify-around items-center mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Detailed Calculation</p>
          <p className="text-xl font-bold text-primary">{detailed.co2_per_passenger_kg?.toFixed(2) ?? 'N/A'} kg</p>
        </div>
        <div className="text-center px-4">
          <div className={`flex items-center justify-center font-bold text-lg ${isCo2Better ? 'text-green-500' : 'text-red-500'}`}>
            {isCo2Better ? <ArrowDown className="h-5 w-5 mr-1" /> : <ArrowUp className="h-5 w-5 mr-1" />}
            {Math.abs(co2Percentage).toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">{isCo2Better ? 'Improvement' : 'Worse'}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Statistical Simulation</p>
          <p className="text-xl font-bold">{statistical.co2_per_passenger_kg?.toFixed(2) ?? 'N/A'} kg</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm">Full Comparison</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground/80 px-2">
                <div className="w-1/4">Metric</div>
                <div className="w-1/4 text-center">Detailed</div>
                <div className="w-1/4 text-center">Statistical</div>
                <div className="w-1/4 text-center">Difference</div>
              </div>
              <ComparisonRow label="Total Fuel" detailedValue={detailed.total_fuel_kg} statisticalValue={statistical.total_fuel_kg} unit="kg" precision={0} />
              <ComparisonRow label="Total Climate Impact" detailedValue={detailed.total_climate_impact_co2e_per_pax_kg} statisticalValue={statistical.total_climate_impact_co2e_per_pax_kg} unit="kg" precision={0} />
              <ComparisonRow label="Efficiency" detailedValue={detailed.efficiency_kg_pax_km} statisticalValue={statistical.efficiency_kg_pax_km} unit="kg/pax-km" smallerIsBetter={true} precision={5} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};


const PhaseData = ({ flight }: { flight: Flight }) => {
  const durations = flight.phase_durations_s;
  const detailed = flight.emission_comparison.detailed_calculation;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
      <div className="space-y-1">
        <h4 className="font-semibold text-sm mt-2 mb-1">Phase Durations</h4>
        <DataRow icon={Timer} label="Takeoff" value={formatSeconds(durations?.takeoff)} />
        <DataRow icon={Timer} label="Climb" value={formatSeconds(durations?.climb)} />
        <DataRow icon={Timer} label="Cruise" value={formatSeconds(durations?.cruise)} />
        <DataRow icon={Timer} label="Descent" value={formatSeconds(durations?.descent)} />
        <DataRow icon={Timer} label="Landing" value={formatSeconds(durations?.landing)} />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-sm mt-2 mb-1">Detailed Fuel & CO₂</h4>
        <DataRow icon={Fuel} label="Total Fuel" value={`${detailed.total_fuel_kg?.toLocaleString() ?? 'N/A'} kg`} />
        <DataRow icon={CloudCog} label="Total CO₂" value={`${detailed.co2_total_kg?.toLocaleString() ?? 'N/A'} kg`} />
      </div>
    </div>
  )
};


export function FlightCard({ flight }: { flight: Flight }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center justify-between w-full space-x-2">
              <div className="flex flex-col items-start text-left w-1/3 truncate">
                <span className="font-bold text-lg text-primary truncate">{flight.flight ?? 'Unknown Flight'}</span>
                <span className="text-sm text-muted-foreground truncate">{flight.aircraft_model ?? 'Unknown Model'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                  <DateTimeCell dateString={flight.created_at} showTime={false} />
                </div>
              </div>
              <div className="flex flex-col items-end text-right w-1/3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{flight.departure_icao ?? 'N/A'}</span>
                  <PlaneTakeoff className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{flight.arrival_icao ?? 'N/A'}</span>
                  <PlaneLanding className="h-4 w-4 text-red-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <EmissionComparisonCard flight={flight} />
            <div className="space-y-1">
              <DataRow icon={Hash} label="Flight ID" value={flight.flight_id ?? 'N/A'} />
              <DataRow icon={ShieldQuestion} label="FR24 ID" value={flight.fr24_id ?? 'N/A'} />
              <DataRow icon={RadioTower} label="Callsign" value={flight.callsign ?? 'N/A'} />
              <DataRow icon={Plane} label="Registration" value={flight.aircraft_reg ?? 'N/A'} />
              <DataRow icon={CalendarClock} label="Departure Time (UTC)" value={<DateTimeCell dateString={flight.departure_time_utc} />} />
              <DataRow icon={CalendarClock} label="Arrival Time (UTC)" value={<DateTimeCell dateString={flight.arrival_time_utc} />} />
              <DataRow icon={Timer} label="Total Flight Time" value={formatSeconds(flight.flight_duration_s)} />
              <DataRow icon={Mountain} label="Calculated Distance" value={`${flight.distance_calculated_km?.toLocaleString() ?? 'N/A'} km`} />
              <DataRow icon={Mountain} label="Great Circle Distance" value={`${flight.great_circle_distance_km?.toLocaleString() ?? 'N/A'} km`} />

              <Accordion type="single" collapsible className="w-full pt-2">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Detailed Data</AccordionTrigger>
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

