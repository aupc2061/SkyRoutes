import type { Review } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, UserCircle, CalendarDays, Plane } from "lucide-react";
import { format } from "date-fns";

interface FlightReviewCardProps {
  review: Review;
}

export function FlightReviewCard({ review }: FlightReviewCardProps) {
  const { airline, flightNumber, rating, comment, userName, date } = review;
  const formattedDate = format(new Date(date), "MMMM d, yyyy");
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={`${userName} avatar`} data-ai-hint="avatar profile" />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{userName}</CardTitle>
              <CardDescription className="flex items-center text-xs">
                <CalendarDays className="h-3 w-3 mr-1" /> Reviewed on {formattedDate}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < rating ? "fill-accent text-accent" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Plane className="h-4 w-4" />
            <span>{airline}</span>
            {flightNumber && <span className="font-medium">({flightNumber})</span>}
        </div>
        <p className="text-foreground/90 leading-relaxed">{comment}</p>
      </CardContent>
    </Card>
  );
}
