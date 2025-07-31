import { getDeckById, getCardsByDeckId } from '@/db/queries';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardsList } from './components/CardsList';
import { AddCardDialog } from './components/AddCardDialog';
import { EditDeckDialog } from './components/EditDeckDialog';
import { DeleteDeckDialog } from './components/DeleteDeckDialog';
import { AIGenerateButton } from './components/AIGenerateButton';
import Link from 'next/link';

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

function validateDeckForAI(title: string, description: string | null): { isValid: boolean; reason?: string } {
  const placeholderTerms = ['untitled', 'new deck', 'description', 'title', 'deck name', 'enter'];
  
  // Check title
  const trimmedTitle = title.trim().toLowerCase();
  if (trimmedTitle.length < 3) {
    return { isValid: false, reason: "Deck title is too short - please provide a descriptive title" };
  }
  
  if (placeholderTerms.some(term => trimmedTitle.includes(term))) {
    return { isValid: false, reason: "Please provide a more specific deck title" };
  }
  
  // Check description
  if (!description || description.trim().length < 10) {
    return { isValid: false, reason: "Please add a meaningful description to help AI generate relevant flashcards" };
  }
  
  const trimmedDescription = description.trim().toLowerCase();
  if (placeholderTerms.some(term => trimmedDescription.includes(term))) {
    return { isValid: false, reason: "Please provide a more detailed description" };
  }
  
  return { isValid: true };
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

    const aiValidation = validateDeckForAI(deck.title, deck.description);

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
              <DeleteDeckDialog 
                deckId={deckIdNum}
                deckTitle={deck.title}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* AI Generation Alert */}
        {!aiValidation.isValid && (
          <Alert>
            <AlertDescription>
              <strong>AI Generation Unavailable:</strong> {aiValidation.reason}
              <br />
              Please update your deck title and description above to enable AI generation.
            </AlertDescription>
          </Alert>
        )}

        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cards</h2>
            <div className="flex gap-2">
              {aiValidation.isValid && <AIGenerateButton deckId={deckIdNum} />}
              <AddCardDialog deckId={deckIdNum} />
            </div>
          </div>
          
          {cards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No cards yet</p>
                <div className="flex gap-2">
                  {aiValidation.isValid && <AIGenerateButton deckId={deckIdNum} />}
                  <AddCardDialog deckId={deckIdNum} />
                </div>
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