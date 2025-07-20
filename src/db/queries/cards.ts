import { auth } from "@clerk/nextjs/server";
import { db } from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';

export async function getCardsByDeckId(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // First verify the deck belongs to the user
  const deck = await db.select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  if (!deck.length) {
    throw new Error("Deck not found or unauthorized");
  }
  
  return await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

export async function getCardById(cardId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Get card with deck info to verify ownership
  const card = await db.select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  return card[0] || null;
}

export async function createCard(data: { deckId: number; front: string; back: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // First verify the deck belongs to the user
  const deck = await db.select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, data.deckId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  if (!deck.length) {
    throw new Error("Deck not found or unauthorized");
  }
  
  const newCard = await db.insert(cardsTable)
    .values(data)
    .returning();
    
  return newCard[0];
}

export async function updateCard(cardId: number, data: { front?: string; back?: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify card belongs to user's deck
  const card = await db.select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  if (!card.length) {
    throw new Error("Card not found or unauthorized");
  }
  
  const updatedCard = await db.update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
    
  return updatedCard[0] || null;
}

export async function deleteCard(cardId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify card belongs to user's deck
  const card = await db.select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  if (!card.length) {
    throw new Error("Card not found or unauthorized");
  }
  
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

export async function getTotalCardCount() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const result = await db.select({ count: count() })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId));
    
  return result[0]?.count || 0;
} 