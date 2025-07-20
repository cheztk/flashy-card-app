import { redirect } from 'next/navigation';
import { getDeckById } from '@/db/queries/decks';
import { getCardsByDeckId } from '@/db/queries/cards';
import StudyInterface from './components/StudyInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId);

  if (isNaN(deckIdNumber)) {
    redirect('/dashboard');
  }

  try {
    // Fetch deck and cards data using centralized queries
    const [deck, cards] = await Promise.all([
      getDeckById(deckIdNumber),
      getCardsByDeckId(deckIdNumber)
    ]);

    if (!deck) {
      redirect('/dashboard');
    }

    if (cards.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Cards to Study</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  This deck doesn't have any cards yet. Add some cards before starting your study session.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button asChild>
                  <Link href={`/decks/${deckId}`}>Add Cards</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{deck.title}</h1>
              <p className="text-muted-foreground mt-1">
                Study Session • {cards.length} cards
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/decks/${deckId}`}>Exit Study</Link>
            </Button>
          </div>
        </div>

        <StudyInterface cards={cards} deckTitle={deck.title} />
      </div>
    );
  } catch (error) {
    console.error('Error loading study page:', error);
    redirect('/dashboard');
  }
} 