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

  return (
    <>
      {showGame ? (
        // If showGame is true, only the MatchingGame component is rendered
        <MatchingGame onGameEnd={returnFromGame} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
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