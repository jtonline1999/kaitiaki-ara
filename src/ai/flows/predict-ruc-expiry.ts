'use server';

/**
 * @fileOverview RUC expiry date prediction flow.
 *
 * - predictRucExpiry - Predicts the expiry date of a vehicle's RUC based on odometer readings.
 * - PredictRucExpiryInput - The input type for the predictRucExpiry function.
 * - PredictRucExpiryOutput - The return type for the predictRucExpiry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PredictRucExpiryInputSchema = z.object({
  odometerReadingKm: z
    .number()
    .describe('The current odometer reading of the vehicle in kilometers.'),
  rucKmsRemaining: z
    .number()
    .describe('The remaining kilometers on the current RUC.'),
  kmPerDay: z
    .number()
    .default(100)
    .describe(
      'The average kilometers the vehicle travels per day. Defaults to 100.'
    ),
});
export type PredictRucExpiryInput = z.infer<typeof PredictRucExpiryInputSchema>;

const PredictRucExpiryOutputSchema = z.object({
  predictedExpiryDate: z
    .string()
    .describe(
      'The predicted expiry date of the RUC in ISO 8601 format (YYYY-MM-DD).'
    ),
});
export type PredictRucExpiryOutput = z.infer<typeof PredictRucExpiryOutputSchema>;

export async function predictRucExpiry(
  input: PredictRucExpiryInput
): Promise<PredictRucExpiryOutput> {
  return predictRucExpiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictRucExpiryPrompt',
  input: {schema: PredictRucExpiryInputSchema},
  output: {schema: PredictRucExpiryOutputSchema},
  prompt: `You are an expert in predicting the expiry date of Road User Charges (RUC) for vehicles based on their odometer readings and daily usage.

Given the following information, calculate the predicted expiry date of the RUC.

Current Odometer Reading (km): {{{odometerReadingKm}}}
RUC Kilometers Remaining: {{{rucKmsRemaining}}}
Average Kilometers per Day: {{{kmPerDay}}}

Calculate the number of days until the RUC expires by dividing the remaining kilometers by the average kilometers per day.  Then add that number of days to the current date to determine the predicted expiry date.

Return the predicted expiry date in ISO 8601 format (YYYY-MM-DD).`,
});

const predictRucExpiryFlow = ai.defineFlow(
  {
    name: 'predictRucExpiryFlow',
    inputSchema: PredictRucExpiryInputSchema,
    outputSchema: PredictRucExpiryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
