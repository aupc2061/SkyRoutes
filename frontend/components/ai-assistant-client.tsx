"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { getTravelAssistantRecommendationsAction } from "@/app/ai-assistant/actions";
import type { TravelAssistantInput, TravelAssistantOutput } from "@/ai/flows/travel-assistant-recommendations";
import { Loader2, Send } from "lucide-react";

const aiAssistantSchema = z.object({
  travelHistory: z.string().min(50, {
    message: "Please provide a detailed summary of your past travel (at least 50 characters).",
  }).max(2000, "Travel history is too long (max 2000 characters)."),
  preferences: z.string().max(1000, "Preferences are too long (max 1000 characters).").optional(),
});

type AIAssistantFormValues = z.infer<typeof aiAssistantSchema>;

export default function AIAssistantClient() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AIAssistantFormValues>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: {
      travelHistory: "",
      preferences: "",
    },
  });

  async function onSubmit(data: AIAssistantFormValues) {
    setRecommendations(null); 
    startTransition(async () => {
      try {
        const result = await getTravelAssistantRecommendationsAction(data as TravelAssistantInput);
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else if (result.recommendations) {
          setRecommendations(result.recommendations);
          toast({
            title: "Recommendations Ready!",
            description: "Your personalized travel suggestions are here.",
          });
        } else {
           toast({
            title: "No Recommendations",
            description: "The AI assistant couldn't generate recommendations at this time.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error submitting AI assistant form:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="travelHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Your Travel History</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your past travels: destinations, airlines, travel style (e.g., solo, family, luxury, budget), what you enjoyed or disliked, etc."
                    className="min-h-[150px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more details you provide, the better the recommendations!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Your Preferences (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What are you looking for in your next trip? E.g., budget (economy, business), interests (adventure, relaxation, culture), desired experiences, preferred airlines, trip duration, etc."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                 <FormDescription>
                  Help the assistant tailor suggestions to your current desires.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Get Recommendations
          </Button>
        </form>
      </Form>

      {isPending && (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Generating your personalized recommendations...</p>
        </div>
      )}

      {recommendations && !isPending && (
        <Card className="mt-8 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Your Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-line">
              {recommendations}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
