// src/ai/flows/travel-assistant-recommendations.ts
'use server';
/**
 * @fileOverview A travel assistant that provides personalized travel recommendations based on user history and preferences.
 *
 * - travelAssistantRecommendations - A function that generates travel recommendations.
 * - TravelAssistantInput - The input type for the travelAssistantRecommendations function.
 * - TravelAssistantOutput - The return type for the travelAssistantRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TravelAssistantInputSchema = z.object({
  travelHistory: z
    .string()
    .describe(
      'A summary of the user\u2019s past travel, including destinations, airlines, travel style, and preferences.'
    ),
  preferences: z
    .string()
    .optional()
    .describe('The user\u2019s travel preferences, such as budget, interests, and desired experiences.'),
});
export type TravelAssistantInput = z.infer<typeof TravelAssistantInputSchema>;

const TravelAssistantOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Personalized travel recommendations, including destinations, airlines, or travel packages.'),
});
export type TravelAssistantOutput = z.infer<typeof TravelAssistantOutputSchema>;

export async function travelAssistantRecommendations(
  input: TravelAssistantInput
): Promise<TravelAssistantOutput> {
  return travelAssistantRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'travelAssistantRecommendationsPrompt',
  input: {schema: TravelAssistantInputSchema},
  output: {schema: TravelAssistantOutputSchema},
  prompt: `You are a travel expert providing personalized travel recommendations based on a user's travel history and preferences.

  Analyze the user's travel history and preferences to suggest destinations, airlines, or travel packages that align with their interests.

  Travel History: {{{travelHistory}}}
  Preferences: {{{preferences}}}

  Recommendations:`,
});

const travelAssistantRecommendationsFlow = ai.defineFlow(
  {
    name: 'travelAssistantRecommendationsFlow',
    inputSchema: TravelAssistantInputSchema,
    outputSchema: TravelAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
