'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting fixes or reasons for JSON discrepancies.
 *
 * - suggestFixes - A function that takes two JSON strings and returns suggestions for discrepancies.
 * - SuggestFixesInput - The input type for the suggestFixes function, containing two JSON strings.
 * - SuggestFixesOutput - The output type for the suggestFixes function, containing suggestions for fixes.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestFixesInputSchema = z.object({
  json1: z.string().describe('The first JSON string.'),
  json2: z.string().describe('The second JSON string.'),
  differences: z.string().describe('The identified differences between the two JSONs.'),
});
export type SuggestFixesInput = z.infer<typeof SuggestFixesInputSchema>;

const SuggestFixesOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for fixes or reasons for the discrepancies.'),
});
export type SuggestFixesOutput = z.infer<typeof SuggestFixesOutputSchema>;

export async function suggestFixes(input: SuggestFixesInput): Promise<SuggestFixesOutput> {
  return suggestFixesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFixesPrompt',
  input: {
    schema: z.object({
      json1: z.string().describe('The first JSON string.'),
      json2: z.string().describe('The second JSON string.'),
      differences: z.string().describe('The identified differences between the two JSONs.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.string().describe('Suggestions for fixes or reasons for the discrepancies.'),
    }),
  },
  prompt: `You are an AI expert at identifying the root cause of differences between two JSON documents.

You are provided with two JSON documents, and a summary of their differences.

Your goal is to explain the root cause of the differences, and suggest fixes.

JSON 1: {{{json1}}}
JSON 2: {{{json2}}}
Differences: {{{differences}}}

Suggestions: `,
});

const suggestFixesFlow = ai.defineFlow<
  typeof SuggestFixesInputSchema,
  typeof SuggestFixesOutputSchema
>(
  {
    name: 'suggestFixesFlow',
    inputSchema: SuggestFixesInputSchema,
    outputSchema: SuggestFixesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
