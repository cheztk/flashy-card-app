"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CardData {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  cards: CardData[];
  deckTitle: string;
}

export default function StudyInterface({ cards, deckTitle }: StudyInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>(() => 
    cards.map((_, index) => index)
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentCard = cards[cardOrder[currentIndex]];
  const progress = (studiedCards.size / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;
  const isFirstCard = currentIndex === 0;

  // Shuffle function
  const shuffleCards = () => {
    const newOrder = [...cardOrder];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setCardOrder(newOrder);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  // Reset study session
  const resetStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIsCompleted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    if (isShuffled) {
      setCardOrder(cards.map((_, index) => index));
      setIsShuffled(false);
    }
  };

  // Flip card
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Handle correct answer
  const handleCorrect = () => {
    setCorrectCount(prev => prev + 1);
    setStudiedCards(prev => new Set([...prev, cardOrder[currentIndex]]));
    nextCard();
  };

  // Handle incorrect answer
  const handleIncorrect = () => {
    setIncorrectCount(prev => prev + 1);
    setStudiedCards(prev => new Set([...prev, cardOrder[currentIndex]]));
    nextCard();
  };

  // Navigate to next card
  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  };

  // Navigate to previous card
  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Jump to specific card
  const jumpToCard = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  };

  // Check if all cards are completed
  useEffect(() => {
    if (studiedCards.size === cards.length && studiedCards.size > 0) {
      setIsCompleted(true);
    }
  }, [studiedCards.size, cards.length]);

  // Keyboard navigation
  useEffect(() => {
    if (isCompleted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
          } else if (currentIndex === cards.length - 1) {
            setIsCompleted(true);
          }
          break;
        case ' ':
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, cards.length, isFlipped, isCompleted]);

  if (isCompleted) {
    const accuracy = correctCount + incorrectCount > 0 ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) : 0;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Study Session Complete! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                You've reviewed all {cards.length} cards in "{deckTitle}"
              </p>
              
              {/* Results */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={resetStudy}>Study Again</Button>
                <Button variant="outline" onClick={shuffleCards}>
                  Shuffle & Study
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentIndex + 1} of {cards.length}
            </Badge>
            {isShuffled && (
              <Badge variant="outline">Shuffled</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {studiedCards.size} studied • {Math.round(progress)}% complete
            {(correctCount > 0 || incorrectCount > 0) && (
              <span className="ml-2">• ✓{correctCount} ✗{incorrectCount}</span>
            )}
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shuffleCards}>
            Shuffle
          </Button>
          <Button variant="outline" size="sm" onClick={resetStudy}>
            Reset
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          ← → Navigate • Space Flip
        </div>
      </div>

      {/* Main Card */}
      <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={flipCard}>
        <CardContent className="p-8">
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center w-full">
              {!isFlipped ? (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Front (Click to reveal answer)</div>
                  <div className="text-lg">{currentCard.front}</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Back</div>
                  <div className="text-lg">{currentCard.back}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {!isFlipped ? (
          <Button onClick={flipCard} className="w-full" size="lg">
            Show Answer
          </Button>
        ) : (
          <>
            <div className="flex gap-2">
              <Button onClick={handleIncorrect} variant="destructive" className="flex-1" size="lg">
                Incorrect ✗
              </Button>
              <Button onClick={handleCorrect} variant="default" className="flex-1" size="lg">
                Correct ✓
              </Button>
            </div>
            <Button onClick={flipCard} variant="outline" size="sm">
              Show Question Again
            </Button>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={previousCard} 
            disabled={isFirstCard}
            className="flex-1"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={nextCard} 
            disabled={isLastCard}
            className="flex-1"
          >
            {isLastCard ? 'Finish' : 'Skip'}
          </Button>
        </div>
      </div>

      {/* Card List for Quick Navigation */}
      {cards.length > 1 && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="text-sm font-medium mb-3">Quick Navigation</h3>
            <div className="flex flex-wrap gap-2">
              {cards.map((_, index) => {
                const cardIndex = cardOrder[index];
                const isStudied = studiedCards.has(cardIndex);
                const isCurrent = index === currentIndex;
                
                return (
                  <Button
                    key={cardIndex}
                    variant={isCurrent ? "default" : isStudied ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => jumpToCard(index)}
                    className="w-10 h-10 p-0"
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click any number to jump to that card
            </p>
          </div>
        </>
      )}
    </div>
  );
} 