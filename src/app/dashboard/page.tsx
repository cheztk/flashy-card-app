import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserDecksWithCardCount, getTotalCardCount } from "@/db/queries";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  // Fetch real data from database
  const [decks, totalCards] = await Promise.all([
    getUserDecksWithCardCount(),
    getTotalCardCount()
  ]);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Create New Deck</Button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Decks</h2>
        {decks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-lg text-muted-foreground mb-4">No decks yet</p>
              <Button>Create Your First Deck</Button>
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