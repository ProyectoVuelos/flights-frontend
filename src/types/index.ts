export interface PhaseDurations {
  takeoff: number;
  climb: number;
  cruise: number;
  descent: number;
  landing: number;
}

export interface DetailedCalculation {
  total_fuel_kg: number;
  co2_total_kg: number;
  co2_per_passenger_kg: number;
  total_climate_impact_co2e_per_pax_kg: number;
  efficiency_kg_pax_km: number;
}

export interface StatisticalSimulation {
  total_fuel_kg: number;
  co2_per_passenger_kg: number;
  total_climate_impact_co2e_per_pax_kg: number;
  efficiency_kg_pax_km: number;
}

export interface EmissionComparison {
  detailed_calculation: DetailedCalculation;
  statistical_simulation: StatisticalSimulation;
}

export interface Flight {
  fr24_id: string;
  flight?: string;
  callsign?: string;
  aircraft_model?: string;
  aircraft_reg?: string;
  departure_icao?: string;
  arrival_icao?: string;
  distance_calculated_km?: number;
  great_circle_distance_km?: number;

  departure_time_utc?: string;
  arrival_time_utc?: string;
  flight_duration_s?: number;

  phase_durations_s: PhaseDurations;
  emission_comparison: EmissionComparison;

  flight_id?: number;
  created_at: string;
  last_updated: string;
}

export interface FlightQueryFilters {
  search?: string;
  airport?: string;
  aircraft_model?: string;
  flight_date?: string;
  limit: number;
  offset: number;
}

export interface SummaryMetrics {
  total_flights: number;
  avg_distance: number;
  total_fuel_saving: number;
  total_co2_saving: number;
}
