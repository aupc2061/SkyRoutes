"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightStatusCard } from "@/components/flight-status-card";
import type { Flight } from "@/lib/types";
import { Search, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FlightStatusPage() {
  const [flightNumberInput, setFlightNumberInput] = useState("");
  const [searchedFlight, setSearchedFlight] = useState<Flight | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumberInput.trim()) {
      setSearchedFlight(undefined);
      return;
    }

    try {
      setIsLoading(true);
      // Extract carrier code and flight number from input
      const match = flightNumberInput.match(/^([A-Za-z0-9]{2})\s*(\d+)$/);
      if (!match) {
        toast({
          title: "Invalid Flight Number",
          description: "Please enter a valid flight number (e.g., 6E 6206, AA 123)",
          variant: "destructive",
        });
        return;
      }

      const [, carrierCode, flightNumber] = match;
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch('/api/flights/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrierCode: carrierCode.toUpperCase(),
          flightNumber,
          scheduledDepartureDate: today
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        setSearchedFlight({
          id: `${carrierCode}${flightNumber}`,
          airline: data.status.airlineName,
          airlineLogoUrl: data.status.airlineLogoUrl,
          flightNumber: data.status.flightNumber,
          origin: data.status.origin,
          destination: data.status.destination,
          departureTime: data.status.departureTime,
          arrivalTime: data.status.arrivalTime,
          status: data.status.status,
          gate: data.status.departureGate,
          terminal: data.status.departureTerminal,
          duration: "0h 0m",
          price: 0
        });
      } else {
        setSearchedFlight(null);
      }
    } catch (error) {
      console.error('Error fetching flight status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch flight status",
        variant: "destructive",
      });
      setSearchedFlight(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Info className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-semibold">Real-Time Flight Status</CardTitle>
          </div>
          <CardDescription>
            Enter a flight number to check its current status, gate, and terminal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Enter Flight Number (e.g., AA123)"
              value={flightNumberInput}
              onChange={(e) => setFlightNumberInput(e.target.value)}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search Status
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchedFlight === undefined && (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Enter a flight number above to see its status.</p>
          </CardContent>
        </Card>
      )}

      {searchedFlight === null && (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">No flight found with number <span className="font-semibold">{flightNumberInput}</span>. Please check the flight number and try again.</p>
          </CardContent>
        </Card>
      )}

      {searchedFlight && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Flight Details</h2>
          <FlightStatusCard flight={searchedFlight} />
        </div>
      )}
    </div>
  );
}
