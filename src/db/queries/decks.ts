import { auth } from "@clerk/nextjs/server";
import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export async function getUserDecks() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.createdAt);
}

export async function getUserDecksWithCardCount() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  return await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    userId: decksTable.userId,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    cardCount: count(cardsTable.id)
  })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id, decksTable.title, decksTable.description, decksTable.userId, decksTable.createdAt, decksTable.updatedAt)
    .orderBy(decksTable.createdAt);
}

export async function getDeckById(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const deck = await db.select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  return deck[0] || null;
}

export async function createDeck(data: { title: string; description?: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const newDeck = await db.insert(decksTable)
    .values({
      ...data,
      userId,
    })
    .returning();
    
  return newDeck[0];
}

export async function updateDeck(deckId: number, data: { title?: string; description?: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const updatedDeck = await db.update(decksTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .returning();
    
  return updatedDeck[0] || null;
}

export async function deleteDeck(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // First verify the deck exists and belongs to the user
  const existingDeck = await db.select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1);
    
  if (existingDeck.length === 0) {
    throw new Error("Deck not found or you don't have permission to delete it");
  }
  
  // Delete the deck (cards will be automatically deleted due to cascade)
  const result = await db.delete(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    );
    
  return result;
}

export async function getDeckCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
    
  return result[0]?.count || 0;
}

export async function canCreateDeck(): Promise<{ canCreate: boolean; reason?: string }> {
  const { has, userId } = await auth();
  if (!userId) return { canCreate: false, reason: "Unauthorized" };
  
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  
  if (hasUnlimitedDecks) {
    return { canCreate: true };
  }
  
  // Check deck count for free users
  const deckCount = await getDeckCount();
  
  if (deckCount >= 3) {
    return { 
      canCreate: false, 
      reason: "Free users can only create 3 decks. Upgrade to Pro for unlimited decks." 
    };
  }
  
  return { canCreate: true };
}

export async function getTotalCardCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId));
    
  return result[0]?.count || 0;
} 