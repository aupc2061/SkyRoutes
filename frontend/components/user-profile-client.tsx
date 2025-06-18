"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { UserProfile, Flight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isBefore } from "date-fns";
import { Plane, CalendarDays, Edit3, Bell, Save } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  preferences: z.object({
    seat: z.enum(["Window", "Aisle", "Middle", "No Preference"]).optional(),
    meal: z.enum(["Vegetarian", "Non-Vegetarian", "Vegan", "No Preference"]).optional(),
    notifications: z.object({
      flightUpdates: z.boolean().default(false),
      checkInReminders: z.boolean().default(false),
      promotionalOffers: z.boolean().default(false),
    }),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfileClientProps {
  initialProfile: UserProfile;
}

export function UserProfileClient({ initialProfile }: UserProfileClientProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [bookingHistory, setBookingHistory] = useState(initialProfile.bookingHistory);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialProfile.name,
      email: initialProfile.email,
      phone: initialProfile.phone || "",
      preferences: {
        seat: initialProfile.preferences.seat || "No Preference",
        meal: initialProfile.preferences.meal || "No Preference",
        notifications: {
          flightUpdates: initialProfile.preferences.notifications.flightUpdates,
          checkInReminders: initialProfile.preferences.notifications.checkInReminders,
          promotionalOffers: initialProfile.preferences.notifications.promotionalOffers,
        },
      },
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  }

  const handleCheckIn = async (flightId: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: flightId,
          status: 'Checked In'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check in');
      }
      // Update local state
      setBookingHistory(prev => {
        if (!prev) return [];
        return prev.map(booking => 
          booking.flightId === flightId 
            ? { ...booking, status: 'Checked In' }
            : booking
        );
      });

      toast({
        title: "Check-in Successful",
        description: "You have successfully checked in for your flight.",
      });
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: error instanceof Error ? error.message : "Failed to check in for flight",
        variant: "destructive",
      });
    }
  };

  const canCheckIn = (departureTime: string, status: string) => {
    const departureDate = new Date(departureTime);
    const twoDaysFromNow = addDays(new Date(), 2);
    return status === 'Confirmed' && isBefore(departureDate, twoDaysFromNow);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Update your name, email, and phone number.</CardDescription>
                </div>
                <Button suppressHydrationWarning={true} type="button" variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input suppressHydrationWarning={true} placeholder="Your full name" {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input suppressHydrationWarning={true} type="email" placeholder="your.email@example.com" {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input suppressHydrationWarning={true} type="tel" placeholder="+1 (555) 000-0000" {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Travel Preferences</CardTitle>
              <CardDescription>Set your preferred seat and meal options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="preferences.seat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seat Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger suppressHydrationWarning={true}>
                          <SelectValue placeholder="Select seat preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No Preference">No Preference</SelectItem>
                        <SelectItem value="Window">Window</SelectItem>
                        <SelectItem value="Aisle">Aisle</SelectItem>
                        <SelectItem value="Middle">Middle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.meal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                      <FormControl>
                        <SelectTrigger suppressHydrationWarning={true}>
                          <SelectValue placeholder="Select meal preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No Preference">No Preference</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                </div>
              <CardDescription>Choose what alerts and information you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="preferences.notifications.flightUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Flight Updates</FormLabel>
                      <FormDescription>Receive real-time updates about your flights.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch suppressHydrationWarning={true} checked={field.value} onCheckedChange={field.onChange} disabled={!isEditing} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.notifications.checkInReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Check-In Reminders</FormLabel>
                      <FormDescription>Get reminders for online check-in.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch suppressHydrationWarning={true} checked={field.value} onCheckedChange={field.onChange} disabled={!isEditing} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.notifications.promotionalOffers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Promotional Offers</FormLabel>
                      <FormDescription>Receive news about special deals and offers.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch suppressHydrationWarning={true} checked={field.value} onCheckedChange={field.onChange} disabled={!isEditing} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {isEditing && (
            <Button suppressHydrationWarning={true} type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          )}
        </form>
      </Form>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Booking History</CardTitle>
          <CardDescription>A record of your past flights booked with SkyRoutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingHistory && bookingHistory.length > 0 ? (
            <ul className="space-y-4">
              {bookingHistory.map((booking) => (
                <li key={booking.flightId} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-md">
                        {booking.origin} to {booking.destination}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.airline} - {booking.flightNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={booking.status === "Checked In" ? "outline" : "secondary"}
                        className={booking.status === "Checked In" ? "border-accent text-accent" : ""}
                      >
                        {booking.status}
                      </Badge>
                      {canCheckIn(booking.departureTime, booking.status) && (
                        <Button
                          variant="default"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleCheckIn(booking.flightId)}
                          size="sm"
                        >
                          Check-in
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {format(new Date(booking.departureTime), "PPP")}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">You have no booking history yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
