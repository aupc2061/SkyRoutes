import type { Flight } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, PlaneLanding, Clock, DollarSign, CalendarDays } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface FlightSearchResultsCardProps {
  flight: Flight;
}

export default function FlightSearchResultsCard({ flight }: FlightSearchResultsCardProps) {
  const { 
    airline, 
    airlineLogoUrl, 
    flightNumber, 
    origin, 
    destination, 
    departureTime, 
    arrivalTime, 
    duration, 
    price 
  } = flight;

  const formattedDepartureDate = format(new Date(departureTime), "MMM d, yyyy");
  const formattedDepartureTime = format(new Date(departureTime), "HH:mm");
  const formattedArrivalTime = format(new Date(arrivalTime), "HH:mm");

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {airlineLogoUrl && (
              <Image 
                src={airlineLogoUrl} 
                alt={`${airline} logo`} 
                width={32} 
                height={32} 
                className="rounded-full"
                data-ai-hint="airline logo" 
              />
            )}
            <CardTitle className="text-lg">{airline}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">{flightNumber}</span>
        </div>
        <CardDescription className="flex items-center gap-1 pt-1">
            <CalendarDays className="h-4 w-4" /> {formattedDepartureDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{formattedDepartureTime}</p>
              <p className="text-xs text-muted-foreground">{origin}</p>
            </div>
          </div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{duration}</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="font-medium">{formattedArrivalTime}</p>
              <p className="text-xs text-muted-foreground">{destination}</p>
            </div>
            <PlaneLanding className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-accent mr-1" />
          <p className="text-xl font-semibold text-accent">${price}</p>
        </div>
        <Button variant="default" className="bg-primary hover:bg-primary/90">Book Now</Button>
      </CardFooter>
    </Card>
  );
}
