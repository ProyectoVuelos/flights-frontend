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

  duration_takeoff_s?: number;
  duration_climb_s?: number;
  duration_cruise_s?: number;
  duration_descent_s?: number;
  duration_landing_s?: number;

  fuel_takeoff_kg?: number;
  fuel_climb_kg?: number;
  fuel_cruise_kg?: number;
  fuel_descent_kg?: number;
  fuel_landing_kg?: number;

  co2_takeoff_kg?: number;
  co2_climb_kg?: number;
  co2_cruise_kg?: number;
  co2_descent_kg?: number;
  co2_landing_kg?: number;
  co2_total_kg?: number;
  co2_per_passenger_kg?: number;

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
