import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Unlock the full potential of your flashcard learning
        </p>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <PricingTable />
      </div>
    </div>
  );
} 