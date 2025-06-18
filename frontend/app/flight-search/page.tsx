"use client";

import { useState, useEffect } from "react";
import FlightSearchForm from "@/components/flight-search-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Flight {
  id: string;
  itineraries: Array<{
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
    }>;
  }>;
  price: {
    total: string;
    currency: string;
  };
  airline: string;
  airlineLogoUrl: string;
  availableSeats?: number;
}

export default function FlightSearchPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);

  const handleSearchResults = async (results: Flight[]) => {
    // Get available seats for each flight
    const flightsWithSeats = await Promise.all(
      results.map(async (flight) => {
        const flightNumber = flight.itineraries[0].segments[0].number;
        const flightDate = flight.itineraries[0].segments[0].departure.at.split('T')[0];
        try {
          const response = await fetch(`/api/flight-seats?flightNumber=${flightNumber}&flightDate=${flightDate}`);
          const data = await response.json();
          return {
            ...flight,
            availableSeats: data.availableSeats
          };
        } catch (error) {
          console.error('Error fetching seats:', error);
          return flight;
        }
      })
    );
    setFlights(flightsWithSeats);
  };

  const handleFlightSelect = (flight: Flight) => {
    router.push(`/flight-search/${flight.id}?data=${encodeURIComponent(JSON.stringify(flight))}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Flight Search</CardTitle>
            <CardDescription>
              Enter your trip details to find available flights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlightSearchForm onSearchResults={handleSearchResults} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Flights</h2>
        {flights.length === 0 ? (
          <p className="text-muted-foreground">No flights found. Please search for flights.</p>
        ) : (
          <div className="grid gap-4">
            {flights.map((flight) => (
              <Card key={flight.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>
                      {flight.itineraries[0].segments[0].departure.iataCode} →{" "}
                      {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                    </span>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-primary">
                        {flight.availableSeats !== undefined ? `${flight.availableSeats} seats left` : '30 seats left'}
                      </Badge>
                      <span>
                        {flight.price.currency} {flight.price.total}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {flight.itineraries[0].segments.map((segment, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={flight.airlineLogoUrl} 
                            alt={flight.airline}
                            className="w-6 h-6 object-contain"
                          />
                          <span className="font-medium">{flight.airline}</span>
                          <span className="text-muted-foreground">{segment.number}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{format(new Date(segment.departure.at), 'HH:mm')}</span>
                          <span className="text-muted-foreground">{segment.departure.iataCode}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{format(new Date(segment.arrival.at), 'HH:mm')}</span>
                          <span className="text-muted-foreground">{segment.arrival.iataCode}</span>
                        </div>
                        {segment.departure.terminal && (
                          <>
                            <span></span>
                          </>
                        )}
                      </div>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md"
                    onClick={() => handleFlightSelect(flight)}
                  >
                    Select Flight
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
