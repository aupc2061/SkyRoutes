import type { Flight } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin, CalendarDays, AlertTriangle, CheckCircle2, XCircle, DoorOpen, Building } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface FlightStatusCardProps {
  flight: Flight;
}

export function FlightStatusCard({ flight }: FlightStatusCardProps) {
  const {
    airline,
    airlineLogoUrl,
    flightNumber,
    origin,
    destination,
    departureTime,
    arrivalTime,
    status,
    gate,
  } = flight;

  const formattedDeparture = format(new Date(departureTime), "MMM d, HH:mm");
  const formattedArrival = format(new Date(arrivalTime), "MMM d, HH:mm");

  const getStatusBadgeVariant = (status?: Flight['status']) => {
    switch (status) {
      case "On Time":
      case "Boarding":
      case "Departed":
      case "Arrived":
        return "default"; // Will use primary color for positive statuses
      case "Delayed":
        return "secondary"; // A distinct color for caution
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status?: Flight['status']) => {
    switch (status) {
      case "On Time":
      case "Arrived":
        return <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />;
      case "Boarding":
        return <DoorOpen className="h-4 w-4 mr-1 text-blue-500" />;
      case "Departed":
         return <Plane className="h-4 w-4 mr-1 text-blue-500" />;
      case "Delayed":
        return <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 mr-1 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {airlineLogoUrl && (
              <Image 
                src={airlineLogoUrl} 
                alt={`${airline} logo`} 
                width={40} 
                height={40} 
                className="rounded-full"
                data-ai-hint="airline logo" 
              />
            )}
            <div>
              <CardTitle className="text-xl">{airline}</CardTitle>
              <CardDescription>Flight {flightNumber}</CardDescription>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(status)} className="text-sm px-3 py-1">
            {getStatusIcon(status)}
            {status || "Unknown"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-primary">Departure</p>
            <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> {origin}</p>
            <p className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /> {formattedDeparture}</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Arrival</p>
            <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> {destination}</p>
            <p className="flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /> {formattedArrival}</p>
          </div>
        </div>
        {gate && (
            <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-semibold mb-2 text-foreground">Gate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p className="flex items-center"><DoorOpen className="h-4 w-4 mr-2 text-muted-foreground" /> Gate: <span className="font-medium ml-1">{gate}</span></p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
