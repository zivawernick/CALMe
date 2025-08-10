import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BreathingApp from './breathing_module/BreathingApp'
import MatchingGame from './MatchingGame'

function App() {
  const [count, setCount] = useState(0)
  // State to control game visibility: true to show game, false to show main app content
  const [showGame, setShowGame] = useState(false);
  const [chatInput, setChatInput] = useState('');

  console.log("App component is rendering!"); // Debugging log for App component

  // Function to set showGame to true, which will render the MatchingGame
  const startGame = () => {
    setShowGame(true);
  };

  // Function to set showGame to false, returning to the main app content
  // This is passed as a prop to MatchingGame and called when the game ends or is exited
  const returnFromGame = () => {
    setShowGame(false);
  };

  const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = chatInput.trim().toLowerCase();
    if (normalized.includes('memory')) {
      startGame();
    }
    setChatInput('');
  };

  return (
    <>
      {showGame ? (
        // If showGame is true, only the MatchingGame component is rendered
        <MatchingGame onGameEnd={returnFromGame} />
      ) : (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4">
          {/* Top row actions */}
          <div className="w-full max-w-5xl flex items-center justify-end gap-3 mb-6">
            <button
              onClick={() => alert('Settings coming soon')}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={() => alert('Red alert triggered')}
              className="px-4 py-2 rounded-md bg-red-500 text-black font-semibold hover:bg-red-600 transition-colors"
            >
              Emo - Red Alert
            </button>
            <button
              onClick={startGame}
              className="px-4 py-2 rounded-md bg-green-600 text-black font-semibold hover:bg-green-700 transition-colors"
            >
              Memory Game
            </button>
          </div>

          {/* Logo section */}
          <div className="flex gap-8 mb-8">
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo hover:opacity-80 transition-opacity" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react hover:opacity-80 transition-opacity" alt="React logo" />
            </a>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Vite + React</h1>

          {/* Chat-like prompt */}
          <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow mb-6">
            <div className="text-gray-800 font-medium mb-2">What activity would you like to try?</div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Try typing 'memory'"
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-black font-semibold hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </form>
          </div>

          {/* Counter section */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              count is {count}
            </button>
            <p className="mt-4 text-gray-600 text-center">
              Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
            </p>

            {/* Button to start the Matching Game */}
            <button
              onClick={startGame}
              className="mt-6 px-8 py-4 bg-green-600 text-black font-bold rounded-lg shadow-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Start Matching Game
            </button>
          </div>

          {/* Breathing App */}
          <div className="mb-8">
            <BreathingApp />
          </div>

          {/* Footer text */}
          <p className="text-gray-500 text-center max-w-md">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      )}
    </>
  )
}

export default App