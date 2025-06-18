"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Clock, Plane, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
}

export default function FlightDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const flightId = params.id;

  const flightData = searchParams.get('data');
  const flight = flightData ? JSON.parse(decodeURIComponent(flightData)) : null;

  const handleSelectFlight = () => {
    try {
      // Store flight data in localStorage for booking process
      localStorage.setItem('selectedFlight', flightData || '');
      
      // Show success message
      toast({
        title: "Flight Selected!",
        description: "Proceeding to booking confirmation.",
        variant: "default",
        duration: 3000,
      });

      // Redirect to booking confirmation page
      router.push('/booking-confirmation');
    } catch (error) {
      console.error('Selection error:', error);
      toast({
        title: "Selection Failed",
        description: "Failed to select flight. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!flight) {
    return (
      <div className="container mx-auto py-8">
        <p>Flight information not found. Please try searching again.</p>
        <Link href="/flight-search">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/flight-search">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Flight Details</CardTitle>
            <CardDescription>Review your flight information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flight Route Overview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{flight.itineraries[0].segments[0].departure.iataCode}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(flight.itineraries[0].segments[0].departure.at), 'HH:mm')}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Plane className="h-6 w-6 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {flight.itineraries[0].segments.length > 1 
                      ? `${flight.itineraries[0].segments.length - 1} Stop${flight.itineraries[0].segments.length > 2 ? 's' : ''}`
                      : 'Direct'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at), 'HH:mm')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{flight.price.currency} {flight.price.total}</div>
                <div className="text-sm text-muted-foreground">Total Price</div>
              </div>
            </div>

            {/* Detailed Flight Segments */}
            <div className="relative">
              <div className="relative bg-card border rounded-lg overflow-hidden">
                <div className="bg-primary/10 p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Flight Details</h3>
                      <p className="text-sm text-muted-foreground">
                        {flight.itineraries[0].segments.length > 1 
                          ? `${flight.itineraries[0].segments.length - 1} Stop${flight.itineraries[0].segments.length > 2 ? 's' : ''}`
                          : 'Direct Flight'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Segments */}
                <div className="p-6">
                  {flight.itineraries[0].segments.map((segment: Flight['itineraries'][0]['segments'][0]) => (
                    <div 
                      key={`${segment.carrierCode}-${segment.number}-${segment.departure.at}`} 
                      className="relative"
                    >
                      <div className="mb-8 last:mb-0">
                        {/* Flight Number and Duration */}
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <Plane className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">Flight {segment.carrierCode} {segment.number}</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(
                                (new Date(segment.arrival.at).getTime() -
                                  new Date(segment.departure.at).getTime()) /
                                  (1000 * 60 * 60)
                              )}h {Math.round(
                                ((new Date(segment.arrival.at).getTime() -
                                  new Date(segment.departure.at).getTime()) /
                                  (1000 * 60)) % 60
                              )}m
                            </div>
                          </div>
                        </div>

                        {/* Flight Route */}
                        <div className="ml-16 grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
                          {/* Departure */}
                          <div>
                            <div className="text-lg font-semibold flex items-center h-6">{segment.departure.iataCode}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(segment.departure.at), 'HH:mm')}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(segment.departure.at), 'MMM d, yyyy')}</div>
                            {segment.departure.terminal && (
                              <div className="text-sm mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  Terminal {segment.departure.terminal}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Flight Path */}
                          <div className="flex items-center relative w-32">
                            <div className="absolute w-full border-t-2 border-dashed border-primary/30"></div>
                            <div className="absolute left-1/2 -translate-x-1/2 bg-card px-2">
                              <Plane className="h-4 w-4 text-primary rotate-90" />
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-lg font-semibold flex items-center justify-end h-6">{segment.arrival.iataCode}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(segment.arrival.at), 'HH:mm')}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(segment.arrival.at), 'MMM d, yyyy')}</div>
                            {segment.arrival.terminal && (
                              <div className="text-sm mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  Terminal {segment.arrival.terminal}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Layover Information */}
                        {segment !== flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1] && (
                          <div className="ml-16 my-6 p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="font-medium">{Math.round(
                                (new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.indexOf(segment) + 1].departure.at).getTime() -
                                  new Date(segment.arrival.at).getTime()) /
                                  (1000 * 60)
                              )} minute layover</span>
                              <span className="mx-2">•</span>
                              <span className="text-muted-foreground">{segment.arrival.iataCode} Airport</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Footer */}
                <div className="bg-primary/5 p-4 border-t">
                  <div className="text-sm text-center text-muted-foreground">
                    Thank you for choosing SkyRoute
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex justify-center">
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-lg transition-colors"
              size="lg"
              onClick={handleSelectFlight}
            >
              Select Flight
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}