import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUserDecksWithCardCount, getTotalCardCount } from "@/db/queries";
import { CreateDeckDialog } from "./components/CreateDeckDialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  // Check user's billing status
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const hasThreeDeckLimit = has({ feature: '3_deck_limit' });
  const isPro = has({ plan: 'pro' });
  
  // Fetch real data from database
  const [decks, totalCards] = await Promise.all([
    getUserDecksWithCardCount(),
    getTotalCardCount()
  ]);
  
  const deckCount = decks.length;
  const isAtLimit = hasThreeDeckLimit && deckCount >= 3;
  const isNearLimit = hasThreeDeckLimit && deckCount >= 2;
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {hasThreeDeckLimit && (
            <div className="flex items-center gap-2 mt-2">
              <Progress value={(deckCount / 3) * 100} className="w-24" />
              <span className="text-sm text-muted-foreground">
                {deckCount}/3 decks
              </span>
              {isPro && (
                <Badge variant="secondary">Pro</Badge>
              )}
            </div>
          )}
          {hasUnlimitedDecks && (
            <Badge variant="secondary" className="mt-2">
              Pro Plan - {deckCount} decks created
            </Badge>
          )}
        </div>
        
        {isAtLimit ? (
          <Button variant="outline" asChild>
            <Link href="/pricing">
              Upgrade for more decks
            </Link>
          </Button>
        ) : (
          <CreateDeckDialog />
        )}
      </div>
      
      {/* Show upgrade prompt for free users near/at limit */}
      {isNearLimit && !hasUnlimitedDecks && (
        <Alert className="mb-6">
          <AlertDescription>
            You're using {deckCount} of 3 free decks. 
            <Button variant="link" className="p-0 h-auto ml-1" asChild>
              <Link href="/pricing">
                Upgrade to Pro
              </Link>
            </Button> for unlimited decks and AI flashcard generation.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Decks</h2>
        {decks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-lg text-muted-foreground mb-4">No decks yet</p>
              {isAtLimit ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    You've reached the free plan limit of 3 decks.
                  </p>
                  <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                  </Button>
                </div>
              ) : (
                <CreateDeckDialog buttonText="Create Your First Deck" />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`} className="block">
                <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader>
                    <CardTitle>{deck.title}</CardTitle>
                    <Badge variant="outline">{deck.cardCount} cards</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {deck.description || 'No description'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <span className="text-xs text-muted-foreground">
                      Updated: {deck.updatedAt ? new Date(deck.updatedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 