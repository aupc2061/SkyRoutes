"use server";

import { travelAssistantRecommendations, type TravelAssistantInput, type TravelAssistantOutput } from '@/ai/flows/travel-assistant-recommendations';

export async function getTravelAssistantRecommendationsAction(
  input: TravelAssistantInput
): Promise<(TravelAssistantOutput & { error?: undefined }) | { error: string; recommendations?: undefined }> {
  try {
    console.log("Server Action: Calling travelAssistantRecommendations with input:", input);
    const result = await travelAssistantRecommendations(input);
    console.log("Server Action: Received result from AI flow:", result);
    if (!result || !result.recommendations) {
        return { error: "AI assistant did not provide recommendations." };
    }
    return result;
  } catch (e: any) {
    console.error("Server Action: Error calling AI flow -", e);
    return { error: e.message || "Failed to get recommendations from AI assistant." };
  }
}
