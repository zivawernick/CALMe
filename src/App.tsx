import { useState, useEffect, useRef } from 'react'
import './App.css'
import BreathingApp from './breathing_module/BreathingApp'
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./chat_interface/ui/avatar";
import { Button } from "./chat_interface/ui/button";
import { MoreVertical, Settings, Accessibility } from "lucide-react"; // Icon TODO - CHANGE
import { toast } from "sonner"; // pop up notifications
import './styles/globals.css'

interface App {
  type: 'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
  label: string;
}

interface Message {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  apps?: App[];
  audioDuration?: number;
}

function App() {
  
  const [messages, setMessages] = useState<Message[]>([
      {
      id: '1',
      type: 'message',
      content: 'Hello! I can help you relax and have fun. What would you like to do today?',
      timestamp: new Date(Date.now() - 210000).toISOString(),
      isUser: false,
    },
    {
      id: '2',
      type: 'audio',
      content: 'Voice message',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      isUser: true,
      audioDuration: 4.2,
    },
    {
      id: '3',
      type: 'app-buttons',
      content: 'Here are some great relaxation activities:',
      timestamp: new Date(Date.now() - 150000).toISOString(),
      isUser: false,
      apps: [ // TODO: change into <BreathingChatButton/>
        { type: 'breathing', label: 'Breathing' },
        { type: 'stretching', label: 'Stretching' },
      ],
    },
    {
      id: '4',
      type: 'message',
      content: 'I\'m also looking for some fun games to play',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      isUser: true,
    },
    {
      id: '5',
      type: 'app-buttons',
      content: 'Perfect! Here are some entertaining games:',
      timestamp: new Date(Date.now() - 90000).toISOString(),
      isUser: false,
      apps: [
        { type: 'matching-cards', label: 'Memory Cards' },
        { type: 'sudoku', label: 'Sudoku' },
        { type: 'puzzle', label: 'Puzzle' },
        { type: 'paint', label: 'Paint' },
      ],
    },
    {
      id: '6',
      type: 'message',
      content: 'What\'s your favorite activity?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      isUser: true,
    },
    {
      id: '7',
      type: 'message',
      content: 'I think breathing exercises are great for starting the day, and painting is wonderful for creativity!',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      isUser: false,
    },
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response with activity/game suggestions
    setTimeout(() => {
      const activityApps = [
        { type: 'breathing' as const, label: 'Breathing' },
        { type: 'stretching' as const, label: 'Stretching' },
      ];
      
      const gameApps = [
        { type: 'matching-cards' as const, label: 'Memory Cards' },
        { type: 'sudoku' as const, label: 'Sudoku' },
        { type: 'puzzle' as const, label: 'Puzzle' },
        { type: 'paint' as const, label: 'Paint' },
      ];
      
      // Randomly suggest either activities or games, never both
      const suggestionTypes = [
        { apps: activityApps, message: 'Try some wellness activities:' },
        { apps: gameApps, message: 'How about some fun games:' },
      ];
      
      // TODO: Not Random, AI desicion
      const randomSuggestion = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
      
      const responses: Message[] = [
        {
          id: (Date.now() + 1).toString(),
          type: 'message',
          content: 'I can help you with that! Let me suggest some activities.',
          timestamp: new Date().toISOString(),
          isUser: false,
        },
        {
          id: (Date.now() + 2).toString(),
          type: 'app-buttons',
          content: randomSuggestion.message,
          timestamp: new Date().toISOString(),
          isUser: false,
          apps: randomSuggestion.apps, // TODO : redefine
        },
      ];
      
      responses.forEach((response, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, response]);
        }, index * 1000);
      });
    }, 1000);
  };

  const handleAppLaunch = (appType: string) => {
    // TODO: define the parser here
    const activityMessages = {
      breathing: 'Starting guided breathing session...',
      stretching: 'Time for some gentle stretches!',
      'matching-cards': 'Let\'s test your memory!',
      sudoku: 'Time to challenge your mind!',
      puzzle: 'Let\'s solve some puzzles!',
      paint: 'Get creative with colors!',
    };
    
    toast.success(`${activityMessages[appType as keyof typeof activityMessages]}`, {
      description: `Launching ${appType} activity for you.`,
    });
    
    // Simulate app launch
    console.log(`Launching activity: ${appType}`);
  };

  const handleAudioPlay = (messageId: string) => {
    // TODO: define onClick function, enable audio
    toast.success('Playing voice message...', {
      description: 'Audio: "I need to take a break and relax"',
    });
    
    // Simulate audio playback
    console.log(`Playing audio message: ${messageId}`);
  };

  const handleVoiceInput = () => {
    // TODO: for future version, create mic enabling
    toast.info('Voice input activated');
  };

  // const handleAddAttachment = () => {
  //   toast.info('Attachment options');
  // };

  const handleAccessibility = () => {
    // TODO: define onClick function
    toast.info('Accessibility options');
  };

  const handleSettings = () => {
    // TODO: define onClick function
    toast.info('Opening settings');
  };

  return (
    <>
      <div 
      // className="flex flex-col h-screen w-full max-w-md mx-auto bg-background border-x border-border relative"
      className="flex flex-col h-screen w-full max-w-md mx-auto bg-background border-x border-border" // new
      >
      {/* Fixed Header */}
      <header 
      // className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
      className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80" // new
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-large">CALMe</h1>
            {/* <p className="text-xs text-muted-foreground">Ready to help</p> */}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleAccessibility}>
            <Accessibility className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleSettings}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Scrollable Chat Messages Area */}
      <ScrollArea ref={scrollAreaRef} 
      // className="flex-1 px-4 py-2"
      className="flex-1 overflow-y-auto px-4" // new
      >
        <div className="space-y-4 pb-4 mt-2">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              isUser={message.isUser}
              apps={message.apps}
              audioDuration={message.audioDuration}
              onAppLaunch={handleAppLaunch}
              onAudioPlay={handleAudioPlay}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Fixed Footer - Chat Input */}
      <div 
      // className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
      className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80" //new
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          onVoiceInput={handleVoiceInput}
          // onAddAttachment={handleAddAttachment}
        />
      </div>
    </div>
    </>
  )
}

export default App
