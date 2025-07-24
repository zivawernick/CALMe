import { useContext, useState, type ReactElement, type ReactSVGElement } from 'react';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Play, Pause, Mic } from "lucide-react";
import { AppsContext, type App } from '../appsContextApi';

// interface App {
//   name: string; //'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
//   type: 'activities' | 'games';
//   label: string;
//   icon?: ReactSVGElement,
//   main: ReactElement
//   discription?: 'string',
// }

interface ChatMessageProps {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
  audioDuration?: number;
  onAppLaunch?: (appType: string) => void;
  onAudioPlay?: (messageId: string) => void;
}

// Custom SVG icons for specific activities
// const LungsIcon = () => (
//   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M12 2C10 2 8.5 3.5 8.5 5.5V12.5C8.5 13.88 9.62 15 11 15H13C14.38 15 15.5 13.88 15.5 12.5V5.5C15.5 3.5 14 2 12 2M6 7C4.5 7 3 8.5 3 10V16C3 17.5 4.5 19 6 19C7.5 19 9 17.5 9 16V10C9 8.5 7.5 7 6 7M18 7C16.5 7 15 8.5 15 10V16C15 17.5 16.5 19 18 19C19.5 19 21 17.5 21 16V10C21 8.5 19.5 7 18 7Z"/>
//   </svg>
// );

// const StretchIcon = () => (
//   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M14.12 10H19V8.2H15.38L13.38 4.87C13.08 4.37 12.54 4.03 11.92 4.03C11.74 4.03 11.58 4.06 11.42 4.11L6.3 5.8L7 7.68L11.42 6.15L12.89 8.54L8 14.89V22H9.8V16.31L13.31 12.9L14.8 14.39V22H16.6V13.89L14.12 10.34V10M8.5 12C9.88 12 11 10.88 11 9.5C11 8.12 9.88 7 8.5 7C7.12 7 6 8.12 6 9.5C6 10.88 7.12 12 8.5 12Z"/>
//   </svg>
// );

// const MatchingCardsIcon = () => (
//   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//     <g>
//       <rect x="2" y="4" width="4" height="6" rx="1" opacity="0.3"/>
//       <rect x="7" y="4" width="4" height="6" rx="1" fill="currentColor"/>
//       <rect x="12" y="4" width="4" height="6" rx="1" opacity="0.3"/>
//       <rect x="17" y="4" width="4" height="6" rx="1" fill="currentColor"/>
//       <rect x="2" y="12" width="4" height="6" rx="1" fill="currentColor"/>
//       <rect x="7" y="12" width="4" height="6" rx="1" opacity="0.3"/>
//       <rect x="12" y="12" width="4" height="6" rx="1" fill="currentColor"/>
//       <rect x="17" y="12" width="4" height="6" rx="1" opacity="0.3"/>
//     </g>
//   </svg>
// );

// const appIcons = {
//   // Replace with react svg element
//   breathing: LungsIcon,
//   stretching: StretchIcon,
//   'matching-cards': MatchingCardsIcon,
//   sudoku: () => <div className="w-5 h-5 border border-current grid grid-cols-3 gap-0.5"><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div><div></div><div className="bg-current"></div></div>,
//   puzzle: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>,
//   paint: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-1.31C18.16 19.67 21 16.17 21 12c0-4.97-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>,
// };

// const appColors = {
//   // TODO: change to single color
//   breathing: 'bg-sky-500 hover:bg-sky-600',
//   stretching: 'bg-green-500 hover:bg-green-600',
//   'matching-cards': 'bg-purple-500 hover:bg-purple-600',
//   sudoku: 'bg-indigo-500 hover:bg-indigo-600',
//   puzzle: 'bg-orange-500 hover:bg-orange-600',
//   paint: 'bg-pink-500 hover:bg-pink-600',
// };

export function ChatMessage({ 
  id, 
  type, 
  content, 
  timestamp, 
  isUser, 
  appsTypes,
  audioDuration = 0,
  onAppLaunch,
  onAudioPlay
}: ChatMessageProps) {
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Context
  const apps = useContext(AppsContext);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      setIsPlaying(true);
      onAudioPlay?.(id);
      
      // Simulate audio playback
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.1;
        setCurrentTime(elapsed);
        
        if (elapsed >= audioDuration) {
          setIsPlaying(false);
          setCurrentTime(0);
          clearInterval(interval);
        }
      }, 100);
    }
  };
// console.log(appsTypes);
// console.log(apps);

return (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start gap-3 max-w-[280px] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* This is Same in both */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={isUser ? undefined : "/api/placeholder/32/32"} />
            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
              {isUser ? "U" : "AI"}
            </AvatarFallback>
          </Avatar>
          
          
          <div className="flex flex-col">
            <div className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                : 'bg-muted text-muted-foreground rounded-bl-sm'
            }`}>

              {/* This is for audio type message 
               if audio input was made, this can be for both ends user and AI */}
              {(type === 'audio')&&
              <>
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 opacity-70" />
                <span className="text-sm opacity-90">{content}</span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 rounded-full ${
                    isUser 
                      ? 'hover:bg-primary-foreground/10 text-primary-foreground' 
                      : 'hover:bg-muted-foreground/10 text-muted-foreground'
                  }`}
                  onClick={handleAudioPlay}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className={`h-1 rounded-full ${
                    isUser ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-100 ${
                        isUser ? 'bg-primary-foreground/60' : 'bg-muted-foreground/60'
                      }`}
                      style={{ width: `${(currentTime / audioDuration) * 100}%` }}
                    />
                  </div>
                </div>
                
                <span className={`text-xs ${
                  isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                }`}>
                  {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(audioDuration)}
                </span>
              </div>
              </>
              }

              {/* This is a plain message Text */}
              {!(type === 'audio') &&
              <p className="text-sm leading-relaxed mb-3">{content}</p>}
              
              {/*  This is for app-button type: App Icons Grid 
              Check if this message should contain activities or games*/}
              {(type === 'app-buttons' && apps && apps.length > 0) &&
              <div className={`grid ${apps.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
                {apps.slice(0, 4).map((app, index) => {
                  
                  if (app.type == appsTypes){
                    return (
                      <Button
                        key={index}
                        onClick={() => onAppLaunch?.(app.main)}
                        className={`bg-indigo-500 text-white border-0 rounded-xl p-3 h-auto flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 text-xs`}
                        size="sm"
                      >

                        {app.icon}
                        <span className="leading-tight">{app.label}</span>
                      </Button>
                  );}
                })}
              </div>}
            
            </div>
            {/* This is TimeStamp for msgs */}
            <span className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(timestamp)}
            </span>
          </div>
        </div>
      </div>
);
}