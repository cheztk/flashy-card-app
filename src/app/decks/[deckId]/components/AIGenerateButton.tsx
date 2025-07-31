"use client";

import { Protect } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateFlashcardsAction } from '../actions';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AIGenerateButtonProps {
  deckId: number;
}

export function AIGenerateButton({ deckId }: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsAction({
        deckId,
        count: 20,
      });
      
      if (result.success) {
        toast.success(`Generated ${result.cardsCreated} flashcards!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Protect
      feature="ai_flashcard_generation"
      fallback={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" disabled className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI generation requires a Pro subscription</p>
              <Button variant="link" size="sm" asChild className="h-auto p-0 mt-1">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="gap-2"
        variant="default"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate with AI'}
      </Button>
    </Protect>
  );
} 