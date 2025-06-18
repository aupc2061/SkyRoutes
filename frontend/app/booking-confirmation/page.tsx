"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Plane, User } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateTicketPDF } from "@/utils/generateTicketPDF";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from 'uuid';

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

export default function BookingConfirmationPage() {  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get flight data from localStorage
    const flightData = localStorage.getItem('selectedFlight');
    if (!flightData) {
      toast({
        title: "No Flight Selected",
        description: "Please select a flight first.",
        variant: "destructive",
      });
      router.push('/flight-search');
      return;
    }

    try {
      const parsedFlight = JSON.parse(decodeURIComponent(flightData));
      setFlight(parsedFlight);
    } catch (error) {
      console.error('Error parsing flight data:', error);
      toast({
        title: "Error",
        description: "Invalid flight data. Please try again.",
        variant: "destructive",
      });
      router.push('/flight-search');
    }
  }, [router, toast]);

  useEffect(() => {    // Fetch user data when user is authenticated
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const response = await fetch('/api/users/profile');
          const data = await response.json();
          if (data.name) {
            setUserName(data.name);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);
  const handleDownloadTicket = async () => {
    if (!isAuthenticated || !user) {
      // Not signed in, redirect to sign in page
      router.push('/auth/signin');
      return;
    }
    try {
      if (!flight || !user.email) return;
      setIsProcessing(true);

      // First, try to get a seat
      const flightNumber = flight.itineraries[0].segments[0].number;
      const flightDate = flight.itineraries[0].segments[0].departure.at.split('T')[0];
      const seatResponse = await fetch('/api/flight-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightNumber,
          flightDate
        }),
      });

      if (!seatResponse.ok) {
        const error = await seatResponse.json();
        throw new Error(error.error || 'Failed to assign seat');
      }

      const seatData = await seatResponse.json();
      const assignedSeat = seatData.seatNumber;

      // Then save the booking with the seat number
      const firstSegment = flight.itineraries[0].segments[0];
      const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
      
      // Generate a unique booking ID that includes flight number and date
      const uniqueBookingId = `${firstSegment.number}-${format(new Date(firstSegment.departure.at), 'yyyy-MM-dd')}-${uuidv4().slice(0, 8)}`;
      
      const bookingData = {
        flightId: uniqueBookingId, // Use our unique booking ID instead of flight.id
        airline: firstSegment.carrierCode,
        flightNumber: firstSegment.number,
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        duration: calculateDuration(firstSegment.departure.at, lastSegment.arrival.at),
        price: parseFloat(flight.price.total),
        status: 'Confirmed',
        seatNumber: assignedSeat
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save booking');
      }

      // Generate and download PDF ticket with user name and seat number
      generateTicketPDF(flight, userName, assignedSeat);
      
      // Show success message
      toast({
        title: "Booking Confirmed!",
        description: `Your ticket has been downloaded and booking saved successfully. Your seat number is ${assignedSeat}.`,
        variant: "default",
        duration: 3000,
      });

    } catch (error) {
      console.error('Booking/PDF generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process booking and generate ticket.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationInMinutes = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60));
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  if (!flight) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading...</p>
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
            <CardTitle className="text-2xl">Download Your Ticket</CardTitle>
            <CardDescription>Review your flight details and download your ticket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passenger Information */}
            <div className="p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold">Passenger</span>
              </div>
              <div className="text-lg">{userName || "Loading..."}</div>
            </div>

            {/* Flight Summary */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{flight.itineraries[0].segments[0].departure.iataCode}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(flight.itineraries[0].segments[0].departure.at), 'HH:mm')}
                  </div>
                </div>
                <Plane className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at), 'HH:mm')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{flight.price.currency} {flight.price.total}</div>
                <div className="text-sm text-muted-foreground">Total Price</div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="space-y-4">
              {flight.itineraries[0].segments.map((segment) => (
                <div 
                  key={`${segment.carrierCode}-${segment.number}-${segment.departure.at}`} 
                  className="p-4 border rounded-lg"
                >
                  <div className="font-semibold mb-2">Flight {segment.carrierCode} {segment.number}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div>{segment.departure.iataCode}</div>
                      <div className="text-sm">{format(new Date(segment.departure.at), 'MMM d, yyyy HH:mm')}</div>
                      {segment.departure.terminal && (
                        <div className="text-sm">Terminal {segment.departure.terminal}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Arrival</div>
                      <div>{segment.arrival.iataCode}</div>
                      <div className="text-sm">{format(new Date(segment.arrival.at), 'MMM d, yyyy HH:mm')}</div>
                      {segment.arrival.terminal && (
                        <div className="text-sm">Terminal {segment.arrival.terminal}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleDownloadTicket}
              disabled={isProcessing || !isAuthenticated}
            >
              {isProcessing ? "Processing..." : "Download Ticket"}
            </Button>
          </CardFooter>
        </Card>        {!isAuthenticated && (
          <div className="text-red-500 mt-2">Please sign in to book a flight.</div>
        )}
      </div>
    </div>
  );
} 