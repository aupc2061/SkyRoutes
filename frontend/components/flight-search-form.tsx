"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users, MapPin, PlaneTakeoff, PlaneLanding, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const flightSearchSchema = z.object({
  origin: z.string().min(3, { message: "Origin must be at least 3 characters." }),
  destination: z.string().min(3, { message: "Destination must be at least 3 characters." }),
  departureDate: z.date({ required_error: "Departure date is required." }),
  returnDate: z.date().optional(),
  passengers: z.coerce.number().min(1, { message: "At least 1 passenger is required." }).max(9, { message: "Maximum 9 passengers."}),
  tripType: z.enum(["one-way", "round-trip"]),
  cabinClass: z.enum(["economy", "premium-economy", "business", "first"]).optional(),
}).refine(data => {
  if (data.tripType === 'round-trip' && !data.returnDate) {
    return false;
  }
  if (data.returnDate && data.returnDate < data.departureDate) {
    return false;
  }
  return true;
}, {
  message: "Return date must be after departure date and is required for round trips.",
  path: ["returnDate"], 
});

type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;

interface FlightSearchFormProps {
  onSearchResults: (results: any[]) => void;
}

export default function FlightSearchForm({ onSearchResults }: FlightSearchFormProps) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const form = useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      passengers: 1,
      tripType: "round-trip",
      cabinClass: "economy",
    },
  });

  async function onSubmit(data: FlightSearchFormValues) {
    try {
      setIsSearching(true);
      console.log('Search Parameters:', {
        originLocationCode: data.origin,
        destinationLocationCode: data.destination,
        departureDate: format(data.departureDate, 'yyyy-MM-dd'),
        adults: data.passengers.toString(),
        travelClass: data.cabinClass?.toUpperCase() || 'ECONOMY'
      });

      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originLocationCode: data.origin,
          destinationLocationCode: data.destination,
          departureDate: format(data.departureDate, 'yyyy-MM-dd'),
          adults: data.passengers.toString(),
          travelClass: data.cabinClass?.toUpperCase() || 'ECONOMY'
        }),
      });

      const result = await response.json();
      console.log('Raw Amadeus API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search flights');
      }

      // Add airline information to the results
      const flightsWithAirlineInfo = result.map((flight: any) => ({
        ...flight,
        airline: getAirlineName(flight.itineraries[0].segments[0].carrierCode),
        airlineLogoUrl: `https://pics.avs.io/200/200/${flight.itineraries[0].segments[0].carrierCode}.png`
      }));

      console.log('Enhanced Flight Data with Airline Info:', flightsWithAirlineInfo);

      toast({
        title: "Flights found!",
        description: `Found ${flightsWithAirlineInfo.length} flights matching your criteria.`,
      });

      onSearchResults(flightsWithAirlineInfo);
    } catch (error) {
      console.error('Flight search error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search flights",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }

  // Helper function to get airline name from code
  function getAirlineName(code: string): string {
    const airlines: Record<string, string> = {
      'AA': 'AMERICAN AIRLINES',
      'BA': 'BRITISH AIRWAYS',
      'DL': 'DELTA AIR LINES',
      'UA': 'UNITED AIRLINES',
      'F9': 'FRONTIER AIRLINES',
      'WN': 'SOUTHWEST AIRLINES',
      'AS': 'ALASKA AIRLINES',
      'B6': 'JETBLUE AIRWAYS',
      'NK': 'SPIRIT AIRLINES',
      'LH': 'LUFTHANSA',
      'AF': 'AIR FRANCE',
      'KL': 'KLM ROYAL DUTCH AIRLINES',
      'EK': 'EMIRATES',
      'QR': 'QATAR AIRWAYS',
      'SQ': 'SINGAPORE AIRLINES',
      'CX': 'CATHAY PACIFIC',
      'QF': 'QANTAS',
      'EY': 'ETIHAD AIRWAYS',
      'TK': 'TURKISH AIRLINES',
      'AI': 'AIR INDIA'
    };
    return airlines[code] || code;
  }

  const tripType = form.watch("tripType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tripType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="round-trip">Round Trip</SelectItem>
                    <SelectItem value="one-way">One Way</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cabinClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cabin Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cabin class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium-economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><PlaneTakeoff className="mr-2 h-4 w-4 text-muted-foreground" /> Origin</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., New York (JFK)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><PlaneLanding className="mr-2 h-4 w-4 text-muted-foreground" /> Destination</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., London (LHR)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {tripType === "round-trip" && (
            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Return Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                            date < (form.getValues("departureDate") || new Date(new Date().setHours(0,0,0,0)))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" /> Passengers</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isSearching}
        >
          {isSearching ? (
            <>Loading...</>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Search Flights
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
