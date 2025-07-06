import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Flashy Cards
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master any subject with intelligent flashcards and spaced repetition learning
          </p>
        </div>

        <SignedOut>
          <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              Get Started
            </h2>
            <p className="text-gray-300 text-center mb-6">
              Sign in or create an account to access your flashcards and track your learning progress.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">∞</div>
                  <div className="text-sm text-gray-300 mt-1">Unlimited Cards</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">📊</div>
                  <div className="text-sm text-gray-300 mt-1">Progress Tracking</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">🧠</div>
                <div className="text-sm text-gray-300 mt-1">Spaced Repetition</div>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                🎉 Welcome back! Your learning journey continues...
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Create Deck</h3>
                  <p className="text-gray-300 text-sm mb-4">Start a new flashcard deck for any subject</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + New Deck
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">Study Session</h3>
                  <p className="text-gray-300 text-sm mb-4">Review cards that need attention</p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Start Studying
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Progress</h3>
                  <p className="text-gray-300 text-sm mb-4">View your learning statistics</p>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    View Stats
                  </button>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-sm text-gray-400">Total Decks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">0</div>
                    <div className="text-sm text-gray-400">Cards Studied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">0</div>
                    <div className="text-sm text-gray-400">Study Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">0%</div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
