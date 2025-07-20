"use server";

import { createCard, updateCard, deleteCard, updateDeck } from '@/db/queries';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreateCardSchema = z.object({
  deckId: z.number().positive(),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
});

const UpdateCardSchema = z.object({
  cardId: z.number().positive(),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
});

const UpdateDeckSchema = z.object({
  deckId: z.number().positive(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type CreateCardInput = z.infer<typeof CreateCardSchema>;
type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export async function createCardAction(input: CreateCardInput) {
  try {
    const validatedInput = CreateCardSchema.parse(input);
    
    const card = await createCard({
      deckId: validatedInput.deckId,
      front: validatedInput.front,
      back: validatedInput.back,
    });
    
    revalidatePath(`/decks/${validatedInput.deckId}`);
    return { success: true, card };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(', ') };
    }
    return { success: false, error: 'Failed to create card' };
  }
}

export async function updateCardAction(input: UpdateCardInput) {
  try {
    const validatedInput = UpdateCardSchema.parse(input);
    
    const card = await updateCard(validatedInput.cardId, {
      front: validatedInput.front,
      back: validatedInput.back,
    });
    
    revalidatePath(`/decks/${card?.deckId}`);
    return { success: true, card };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(', ') };
    }
    return { success: false, error: 'Failed to update card' };
  }
}

export async function deleteCardAction(cardId: number, deckId: number) {
  try {
    await deleteCard(cardId);
    
    revalidatePath(`/decks/${deckId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete card' };
  }
}

export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    const validatedInput = UpdateDeckSchema.parse(input);
    
    const deck = await updateDeck(validatedInput.deckId, {
      title: validatedInput.title,
      description: validatedInput.description,
    });
    
    revalidatePath(`/decks/${validatedInput.deckId}`);
    revalidatePath('/dashboard');
    return { success: true, deck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(', ') };
    }
    return { success: false, error: 'Failed to update deck' };
  }
} 