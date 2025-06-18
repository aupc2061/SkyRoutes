import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Search, Clock, MessageSquare } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="flex-1 relative min-h-screen w-screen overflow-x-hidden">
      {/* Background image */}
      <div className="fixed top-0 left-0 right-0 bottom-0 -z-10">
        <img
          src="https://media.gettyimages.com/id/1459518885/video/timelapse-milky-way-time-lapse.jpg?s=640x640&k=20&c=ziMm9H3IKooAqco6Yp90Dz1K86SqNunOuNJyWSVnTd8="
          alt="Sky background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to SkyRoutes
              </h1>
              <p className="mx-auto max-w-[700px] text-white md:text-xl">
                Your journey begins here. Search flights, track status, and get AI-powered travel recommendations.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/flight-search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Flights
                </Link>
              </Button>
              {!session && (
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Link href="/flight-search" className="group">
              <Card className="transition-transform group-hover:scale-105 group-hover:shadow-xl cursor-pointer bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <Plane className="h-10 w-10 text-primary" />
                  <CardTitle>Flight Search</CardTitle>
                  <CardDescription>Find the best flights for your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Search through thousands of flights, compare prices, and book your next adventure.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/flight-status" className="group">
              <Card className="transition-transform group-hover:scale-105 group-hover:shadow-xl cursor-pointer bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary" />
                  <CardTitle>Flight Status</CardTitle>
                  <CardDescription>Track your flights in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Get real-time updates on flight delays, gate changes, and arrival times.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-assistant" className="group">
              <Card className="transition-transform group-hover:scale-105 group-hover:shadow-xl cursor-pointer bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary" />
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>Get travel recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our AI assistant helps you plan the perfect trip based on your preferences.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
