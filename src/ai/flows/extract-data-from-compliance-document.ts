'use server';
/**
 * @fileOverview Extracts data from compliance documents using OCR.
 *
 * - extractDataFromComplianceDocument - A function that extracts data from compliance documents.
 * - ExtractDataFromComplianceDocumentInput - The input type for the extractDataFromComplianceDocument function.
 * - ExtractDataFromComplianceDocumentOutput - The return type for the extractDataFromComplianceDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromComplianceDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a compliance document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDataFromComplianceDocumentInput = z.infer<
  typeof ExtractDataFromComplianceDocumentInputSchema
>;

const ExtractDataFromComplianceDocumentOutputSchema = z.object({
  extractedData: z
    .string()
    .describe("The extracted data from the compliance document."),
});
export type ExtractDataFromComplianceDocumentOutput = z.infer<
  typeof ExtractDataFromComplianceDocumentOutputSchema
>;

export async function extractDataFromComplianceDocument(
  input: ExtractDataFromComplianceDocumentInput
): Promise<ExtractDataFromComplianceDocumentOutput> {
  return extractDataFromComplianceDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromComplianceDocumentPrompt',
  input: {schema: ExtractDataFromComplianceDocumentInputSchema},
  output: {schema: ExtractDataFromComplianceDocumentOutputSchema},
  prompt: `You are an expert data extraction specialist.

You will use OCR to extract data from the compliance document image provided.

Extract all the text you can from the image.

Image: {{media url=photoDataUri}}`,
});

const extractDataFromComplianceDocumentFlow = ai.defineFlow(
  {
    name: 'extractDataFromComplianceDocumentFlow',
    inputSchema: ExtractDataFromComplianceDocumentInputSchema,
    outputSchema: ExtractDataFromComplianceDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
