import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            FlashyCard
          </h1>
          <p className="text-xl text-gray-300">
            Your personal flashcard platform
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <SignInButton 
            mode="modal" 
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          >
            <Button variant="default" size="lg">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton 
            mode="modal" 
            forceRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
          >
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
