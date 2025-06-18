import { UserProfileClient } from "@/components/user-profile-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type SeatPreference = "Window" | "Aisle" | "Middle" | "No Preference";
type MealPreference = "Vegetarian" | "Non-Vegetarian" | "Vegan" | "No Preference";

interface UserDocument {
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    seat?: SeatPreference;
    meal?: MealPreference;
    notifications?: {
      flightUpdates?: boolean;
      checkInReminders?: boolean;
      promotionalOffers?: boolean;
    };
  };
  bookingHistory?: Array<{
    flightId?: string;
    airline?: string;
    flightNumber?: string;
    origin?: string;
    destination?: string;
    departureTime?: Date;
    arrivalTime?: Date;
    duration?: string;
    price?: number;
    status?: string;
  }>;
}

async function getUserProfile() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  await connectDB();
  const userDoc = await User.findOne({ email: session.user.email })
    .select('-password')
    .lean();

  if (!userDoc) {
    redirect('/auth/signin');
  }

  // Type assertion after validation
  const user = userDoc as unknown as UserDocument;

  // Create a clean profile object with only the data we need
  const profile = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    preferences: {
      seat: (user.preferences?.seat || 'No Preference') as SeatPreference,
      meal: (user.preferences?.meal || 'No Preference') as MealPreference,
      notifications: {
        flightUpdates: user.preferences?.notifications?.flightUpdates || false,
        checkInReminders: user.preferences?.notifications?.checkInReminders || false,
        promotionalOffers: user.preferences?.notifications?.promotionalOffers || false,
      },
    },
    bookingHistory: (user.bookingHistory || []).map(booking => ({
      flightId: booking.flightId || '',
      airline: booking.airline || '',
      flightNumber: booking.flightNumber || '',
      origin: booking.origin || '',
      destination: booking.destination || '',
      departureTime: booking.departureTime ? new Date(booking.departureTime).toISOString() : new Date().toISOString(),
      arrivalTime: booking.arrivalTime ? new Date(booking.arrivalTime).toISOString() : new Date().toISOString(),
      duration: booking.duration || '',
      price: booking.price || 0,
      status: booking.status || 'unknown'
    }))
  };

  return profile;
}

export default async function ProfilePage() {
  const userProfile = await getUserProfile();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-semibold">Your Profile</CardTitle>
          </div>
          <CardDescription>Manage your personal information, travel preferences, and notification settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfileClient initialProfile={userProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
