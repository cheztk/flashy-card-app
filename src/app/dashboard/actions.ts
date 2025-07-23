"use server";

import { createDeck, canCreateDeck } from '@/db/queries';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  try {
    // Validate input with Zod
    const validatedInput = CreateDeckSchema.parse(input);
    
    // Check if user can create deck (billing limits)
    const { canCreate, reason } = await canCreateDeck();
    if (!canCreate) {
      return {
        success: false,
        error: reason
      };
    }
    
    // Use centralized query function
    const newDeck = await createDeck(validatedInput);
    
    // Revalidate the dashboard page to show the new deck
    revalidatePath('/dashboard');
    
    return { success: true, deck: newDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation failed: ${error.issues.map(issue => issue.message).join(', ')}`
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
} 