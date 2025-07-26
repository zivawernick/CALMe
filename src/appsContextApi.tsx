import { createContext, type ReactElement } from 'react';
import BreathingExercise from './breathing_module/BreathingExercise';

// Define the App interface as provided by the user
// Using a union type for 'name' for strict type checking
export interface AppInterface {
  name: 'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
  type: 'activities' | 'games';
  label: string;
  // icon is a ReactElement that renders an SVG, e.g., <svg>...</svg>
  icon?: ReactElement | undefined;
  main: any; // The main component/element to render for this app
  description?: string | undefined;
}

// Define the type for the context value
// interface AppsContextType {
//   apps: App[];
// }

export const InnerApps: AppInterface[] = [
    {
      name: 'breathing',
      type: 'activities',
      label: 'Breathing Exercise',
      icon: (

        // Example SVG icon for breathing (heart/lung related)
        <div>🫁</div> // TODO: change into SVG icon (better than below)
        // <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        //   <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        // </svg>
      ),
      main: <BreathingExercise />,
      description: 'A guided breathing exercise to help you relax and focus.',
    },
    {
      name: 'stretching',
      type: 'activities',
      label: 'Stretching Routine',
      icon: (
        // Example SVG icon for stretching (person stretching)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.12 10H19V8.2H15.38L13.38 4.87C13.08 4.37 12.54 4.03 11.92 4.03C11.74 4.03 11.58 4.06 11.42 4.11L6.3 5.8L7 7.68L11.42 6.15L12.89 8.54L8 14.89V22H9.8V16.31L13.31 12.9L14.8 14.39V22H16.6V13.89L14.12 10.34V10M8.5 12C9.88 12 11 10.88 11 9.5C11 8.12 9.88 7 8.5 7C7.12 7 6 8.12 6 9.5C6 10.88 7.12 12 8.5 12Z"/>
        </svg>
      ),
      main: (
        <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
          <p className="text-xl font-bold mb-2">Stretching Routine App</p>
          <p>Content for various stretching exercises will go here.</p>
        </div>
      ),
      description: 'Follow along with simple stretching exercises to improve flexibility.',
    },
    {
      name: 'matching-cards',
      type: 'games',
      label: 'Matching Cards',
      icon: (
        // Example SVG icon for cards (playing cards)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <g>
      <rect x="2" y="4" width="4" height="6" rx="1" opacity="0.3"/>
      <rect x="7" y="4" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="12" y="4" width="4" height="6" rx="1" opacity="0.3"/>
      <rect x="17" y="4" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="2" y="12" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="7" y="12" width="4" height="6" rx="1" opacity="0.3"/>
      <rect x="12" y="12" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="17" y="12" width="4" height="6" rx="1" opacity="0.3"/>
    </g>
  </svg>
      ),
      main: (
        <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
          <p className="text-xl font-bold mb-2">Matching Cards Game</p>
          <p>The game board for matching pairs will be rendered here.</p>
        </div>
      ),
      description: 'Test your memory and concentration with this classic matching game.',
    },
    {
      name: 'sudoku',
      type: 'games',
      label: 'Sudoku',
      icon: (
        // Example SVG icon for Sudoku (grid with numbers)
        <div className="w-5 h-5 border border-current grid grid-cols-3 gap-0.5"><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div></div>
      ),
      main: (
        <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
          <p className="text-xl font-bold mb-2">Sudoku Game</p>
          <p>The interactive Sudoku grid will appear here.</p>
        </div>
      ),
      description: 'A challenging number puzzle game to sharpen your logic skills.',
    },
    {
      name: 'puzzle',
      type: 'games',
      label: 'Jigsaw Puzzle',
      icon: (
        // Example SVG icon for puzzle (puzzle piece)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>
      ),
      main: (
        <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
          <p className="text-xl font-bold mb-2">Jigsaw Puzzle Game</p>
          <p>Drag and drop pieces to complete the puzzle.</p>
        </div>
      ),
      description: 'Assemble various images by dragging and dropping puzzle pieces.',
    },
    {
      name: 'paint',
      type: 'activities',
      label: 'Digital Canvas',
      icon: (
        // Example SVG icon for paint (paint brush)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-1.31C18.16 19.67 21 16.17 21 12c0-4.97-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>
      ),
      main: (
        <div className="text-center p-6 bg-gray-600 rounded-lg text-white">
          <p className="text-xl font-bold mb-2">Digital Canvas App</p>
          <p>Unleash your creativity with this simple drawing tool.</p>
        </div>
      ),
      description: 'A simple drawing application to unleash your creativity.',
    },
  ];

// Create the context with a default undefined value.
export const AppsContext = createContext<AppInterface[] | undefined>(undefined);


export const AppsProvider  = AppsContext.Provider
export const AppsConsumer = AppsContext.Consumer;

/**
 * useApps Hook
 * A custom hook to consume the AppsContext.
 * Throws an error if used outside of an AppsProvider, ensuring proper usage.
 * returns {AppsContextType} The context value containing the array of apps.
 */
// export const useApps = (): AppsContextType => {
//   const context = useContext(AppsContext);
//   if (context === undefined) {
//     throw new Error('useApps must be used within an AppsProvider');
//   }
//   return context;
// };
