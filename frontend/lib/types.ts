export interface Flight {
  id: string;
  airline: string;
  airlineLogoUrl?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  status?: 'On Time' | 'Delayed' | 'Cancelled' | 'Boarding' | 'Departed' | 'Arrived';
  gate?: string;
  terminal?: string;
}

export interface Review {
  id: string;
  flightId?: string; // Optional: link review to a specific flight
  airline: string;
  flightNumber?: string;
  rating: number; // 1-5
  comment: string;
  userName: string;
  date: string; // ISO date string
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  preferences: {
    seat?: 'Window' | 'Aisle' | 'Middle' | 'No Preference';
    meal?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'No Preference';
    notifications: {
      flightUpdates: boolean;
      checkInReminders: boolean;
      promotionalOffers: boolean;
    };
  };
  bookingHistory?: {
    flightId: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    status: string;
  }[];
}

export type TravelAssistantPreferences = {
  budget?: string; // e.g., "economy", "business", "luxury"
  interests?: string[]; // e.g., ["adventure", "beach", "culture"]
  travelStyle?: string; // e.g., "solo", "family", "couple"
  preferredAirlines?: string[];
  tripDuration?: string; // e.g., "weekend", "1 week", "2 weeks"
};

export type TravelAssistantHistoryEntry = {
  destination: string;
  year: number;
  travelStyle?: string; // "solo", "family", "business"
  notes?: string; // "Loved the beaches", "Too crowded"
};
