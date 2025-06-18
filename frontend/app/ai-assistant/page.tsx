import AIAssistantClient from "@/components/ai-assistant-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AIAssistantPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-semibold">AI Travel Assistant</CardTitle>
          </div>
          <CardDescription>
            Get personalized travel recommendations based on your past travel history and preferences.
            Describe your previous trips and what you're looking for in your next adventure!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIAssistantClient />
        </CardContent>
      </Card>
    </div>
  );
}
