"use server";

import { createCard, updateCard, deleteCard, updateDeck, deleteDeck, getDeckById } from '@/db/queries';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
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

export async function deleteDeckAction(deckId: number) {
  try {
    // Validate deckId
    if (!deckId || isNaN(deckId) || deckId <= 0) {
      throw new Error(`Invalid deck ID: ${deckId}`);
    }
    
    await deleteDeck(deckId);
    
    // Return success without revalidating (since we're navigating away)
    return { success: true };
  } catch (error) {
    console.error('Error deleting deck:', error);
    
    // Re-throw the original error message for better debugging
    throw new Error(error instanceof Error ? error.message : 'Failed to delete deck');
  }
} 

const GenerateFlashcardsSchema = z.object({
  deckId: z.number().positive(),
  count: z.number().min(1).max(50).default(20),
});

// Native JSON Schema for OpenAI
const FlashcardGenerationJSONSchema = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: {
            type: "string",
            description: "The question or prompt for the front of the flashcard"
          },
          back: {
            type: "string", 
            description: "The answer or explanation for the back of the flashcard"
          }
        },
        required: ["front", "back"],
        additionalProperties: false
      },
      minItems: 1,
      maxItems: 50
    }
  },
  required: ["flashcards"],
  additionalProperties: false
} as const;

type FlashcardGenerationResult = {
  flashcards: Array<{
    front: string;
    back: string;
  }>;
};

type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsSchema>;

export async function generateFlashcardsAction(input: GenerateFlashcardsInput) {
  // 1. Validate input
  const validatedInput = GenerateFlashcardsSchema.parse(input);
  
  // 2. Check authentication
  const { has, userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // 3. CHECK AI FEATURE ACCESS (MANDATORY)
  const hasAIFeature = has({ feature: 'ai_flashcard_generation' });
  if (!hasAIFeature) {
    throw new Error("AI flashcard generation requires a Pro subscription");
  }
  
  // 4. Verify deck ownership
  const deck = await getDeckById(validatedInput.deckId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }
  
  try {
    // 5. Generate flashcards with AI using JSON mode
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      output: 'no-schema',
      mode: 'json',
      prompt: `Generate exactly ${validatedInput.count} flashcards based on this topic: "${deck.title}". 
               ${deck.description ? `Additional context: "${deck.description}".` : ''}
               Create educational flashcards with clear questions on the front and concise answers on the back.
               Make them suitable for studying and memorization.
               
               Return a JSON object with this exact structure:
               {
                 "flashcards": [
                   {"front": "question text", "back": "answer text"},
                   {"front": "question text", "back": "answer text"}
                 ]
               }`,
      temperature: 0.7,
    });
    
    // 6. Parse and validate the response
    const parsedObject = object as FlashcardGenerationResult;
    
    if (!parsedObject.flashcards || !Array.isArray(parsedObject.flashcards)) {
      throw new Error("Invalid response format from AI");
    }
    
    // 7. Save generated cards to database
    const createdCards = [];
    for (const flashcard of parsedObject.flashcards) {
      if (!flashcard.front || !flashcard.back) {
        continue; // Skip invalid cards
      }
      
      const card = await createCard({
        deckId: validatedInput.deckId,
        front: flashcard.front,
        back: flashcard.back,
      });
      createdCards.push(card);
    }
    
    revalidatePath(`/decks/${validatedInput.deckId}`);
    
    return {
      success: true,
      cardsCreated: createdCards.length,
      cards: createdCards,
    };
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    
    // Handle specific AI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error("AI service is temporarily busy. Please try again in a moment.");
      }
      if (error.message.includes('content policy')) {
        throw new Error("Unable to generate content for this topic. Please try a different subject.");
      }
    }
    
    throw new Error("Failed to generate flashcards. Please try again.");
  }
}