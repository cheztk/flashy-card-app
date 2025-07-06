import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Flashy Card App",
  description: "A flashcard application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          socialButtonsBlockButton: "hidden",
          socialButtonsProviderIcon: "hidden",
          dividerRow: "hidden",
          socialButtonsBlockButtonText: "hidden",
          socialButtons: "hidden",
          socialButtonsIconButton: "hidden",
        },
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          showOptionalFields: false,
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${poppins.variable} font-sans antialiased`}>
          <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">Flashy Cards</h1>
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant='default'>Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
