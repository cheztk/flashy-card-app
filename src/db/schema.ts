import { integer, pgTable, varchar, text, timestamp, serial } from "drizzle-orm/pg-core";

export const decksTable = pgTable("decks", {
  id: serial("id").primaryKey(),
  title: varchar("title" ,{ length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_Id", { length: 255 }).notNull(), // Clerk user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 