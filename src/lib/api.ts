import type { Flight } from "@/types";
import { Settings } from "./env-manager";

export async function fetchFlights(): Promise<Flight[]> {
  const response = await fetch(`${Settings.backendUrl}/flights`);
  if (!response.ok) {
    throw new Error("Failed to fetch flight data");
  }
  const data = await response.json();
  return data;
}
