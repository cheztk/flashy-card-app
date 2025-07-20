import { getDeckById, getCardsByDeckId } from '@/db/queries';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CardsList } from './components/CardsList';
import { AddCardDialog } from './components/AddCardDialog';
import { EditDeckDialog } from './components/EditDeckDialog';
import Link from 'next/link';

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const { deckId } = await params;
  const deckIdNum = parseInt(deckId);
  
  if (isNaN(deckIdNum)) {
    notFound();
  }

  try {
    const [deck, cards] = await Promise.all([
      getDeckById(deckIdNum),
      getCardsByDeckId(deckIdNum)
    ]);

    if (!deck) {
      notFound();
    }

    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="outline">← Back to Decks</Button>
            </Link>
          </div>
          <AddCardDialog deckId={deckIdNum} />
        </div>

        {/* Deck Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{deck.title}</CardTitle>
              <Badge variant="secondary">{cards.length} cards</Badge>
            </div>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/decks/${deckId}/study`}>Study Deck</Link>
              </Button>
              <EditDeckDialog 
                deckId={deckIdNum} 
                currentTitle={deck.title}
                currentDescription={deck.description || undefined}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cards</h2>
          </div>
          
          {cards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No cards yet</p>
                <AddCardDialog deckId={deckIdNum} />
              </CardContent>
            </Card>
          ) : (
            <CardsList cards={cards} deckId={deckIdNum} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading deck:', error);
    notFound();
  }
} 