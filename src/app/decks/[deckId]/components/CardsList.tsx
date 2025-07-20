"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditCardDialog } from './EditCardDialog';
import { DeleteCardDialog } from './DeleteCardDialog';

interface CardData {
  id: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  deckId: number;
}

interface CardsListProps {
  cards: CardData[];
  deckId: number;
}

export function CardsList({ cards, deckId }: CardsListProps) {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.id} className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-end">
              <div className="flex gap-1">
                <EditCardDialog card={card} />
                <DeleteCardDialog cardId={card.id} deckId={deckId} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Front:
                </p>
                <p className="text-sm">{card.front}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Back:
                </p>
                <p className="text-sm">{card.back}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 