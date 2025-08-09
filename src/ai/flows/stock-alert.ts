'use server';
/**
 * @fileOverview An AI agent that generates stock alerts based on historical trends.
 *
 * - generateStockAlert - A function that generates a stock alert.
 * - StockAlertInput - The input type for the generateStockAlert function.
 * - StockAlertOutput - The return type for the generateStockAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockAlertInputSchema = z.object({
  historicalSalesData: z
    .string()
    .describe(
      'Historical sales data, as a JSON string.  Each object should contain product name and sales quantity over time.'
    ),
  currentStockLevels: z
    .string()
    .describe(
      'Current stock levels for each product, as a JSON string. Each object should contain product name and stock quantity.'
    ),
});
export type StockAlertInput = z.infer<typeof StockAlertInputSchema>;

const StockAlertOutputSchema = z.object({
  productsToRestock: z
    .array(z.string())
    .describe(
      'An array of product names that need to be restocked soon based on historical sales data.'
    ),
  reasoning: z.string().describe('The AI reasoning behind the restock recommendations.'),
});
export type StockAlertOutput = z.infer<typeof StockAlertOutputSchema>;

export async function generateStockAlert(input: StockAlertInput): Promise<StockAlertOutput> {
  return generateStockAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockAlertPrompt',
  input: {schema: StockAlertInputSchema},
  output: {schema: StockAlertOutputSchema},
  prompt: `You are an AI assistant that analyzes historical sales data and current stock levels to identify products that need to be restocked soon to prevent stockouts.

Analyze the following historical sales data:
{{{historicalSalesData}}}

Consider the current stock levels:
{{{currentStockLevels}}}

Based on this information, recommend a list of products that should be restocked soon. Explain your reasoning.

Output should be a JSON object containing a \"productsToRestock\" key (an array of product names) and a \"reasoning\" key (a string explaining the reasoning).`,
});

const generateStockAlertFlow = ai.defineFlow(
  {
    name: 'generateStockAlertFlow',
    inputSchema: StockAlertInputSchema,
    outputSchema: StockAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
