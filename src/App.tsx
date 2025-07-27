import { useState, useEffect, useRef, useContext } from 'react'
import './App.css'
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./chat_interface/ui/avatar";
import { Button } from "./chat_interface/ui/button";
import { MoreVertical, Settings, Accessibility } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AppsContext, AppsProvider, InnerApps, type AppInterface } from './appsContextApi';
import AppLauncer from './AppLauncher/AppLauncer';
import { ConversationController } from './conversation/ConversationController';
import { AlertTimer } from './components/AlertTimer';

// Chat Interface
interface Message {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
  audioDuration?: number;
  nodeId: string;
}

// Conversation is now handled by ConversationController

function App() {
  const [conversationController] = useState(() => new ConversationController());
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAlertButton, setShowAlertButton] = useState(true);
  const [alertTimer, setAlertTimer] = useState<number | null>(null);
  const [alertInterval, setAlertInterval] = useState<ReturnType<typeof setInterval> | null>(null); 
  const [showAppsLauncher, setShowAppsLauncher] = useState(false);
  const [shouldAutoLaunchApp, setShouldAutoLaunchApp] = useState(false);
  const [chosenApp, setChosenApp] = useState<AppInterface | undefined>();
  const [appsTimeout, setAppsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activityReturnNode, setActivityReturnNode] = useState<string | null>(null);

  const appsContext = useContext(AppsContext);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize conversation after controller loads profile
  useEffect(() => {
    const initializeConversation = async () => {
      // Wait a bit for the controller to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialNode = conversationController.getCurrentNode();
      setConversationHistory([{
        id: Date.now().toString(),
        type: 'message',
        content: initialNode.content || "Hello! I'm here with you.",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: initialNode.id
      }]);
      setIsInitialized(true);
    };
    
    initializeConversation();
  }, [conversationController]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversationHistory]);

  // Process user input when it changes
  useEffect(() => {
    if (userInput !== '' && isInitialized) {
      processUserInput();
    }
  }, [userInput, isInitialized]);

  const processUserInput = () => {
    if (!userInput.trim()) return;
    
    try {
      // Get current parser type from conversation controller
      const parserType = conversationController.getCurrentParserType();
      if (!parserType) {
        console.warn('No parser type specified for current node');
        return;
      }

      // Run parser through the controller
      const stepResult = conversationController.runParser(parserType, userInput);
      
      // Process with conversation controller
      const { nextNode, activityTrigger } = conversationController.processParserOutput(stepResult);
      
      // Add system response
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'message',
        content: nextNode.content || "How can I help you?",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: nextNode.id
      };
      
      setConversationHistory(prev => [...prev, newMessage]);
      
      // Handle activity trigger with natural delay
      if (activityTrigger) {
        setActivityReturnNode(activityTrigger.returnNode);
        const targetApp = appsContext?.find((app) => app.name === activityTrigger.activityName);
        
        if (targetApp) {
          // Show a transitional message for activities
          if (activityTrigger.activityName === 'breathing') {
            const transitionMsg: Message = {
              id: Date.now().toString() + '_transition',
              type: 'message',
              content: "You seem like you could use a moment to relax. Let's try some breathing exercises.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: nextNode.id
            };
            setConversationHistory(prev => [...prev, transitionMsg]);
          }
          
          setChosenApp(targetApp);
          setShouldAutoLaunchApp(true);
          const timer = setTimeout(() => {
            setShowAppsLauncher(true);
          }, 2000); // 2 second delay for user to read
          setAppsTimeout(timer);
        } else if (!['breathing', 'matching'].includes(activityTrigger.activityName)) {
          // Show placeholder for unbuilt activities
          const placeholderMsg: Message = {
            id: Date.now().toString() + '_placeholder',
            type: 'message',
            content: `Activity "${activityTrigger.activityName}" would be called, but is still in development.`,
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: nextNode.id
          };
          setConversationHistory(prev => [...prev, placeholderMsg]);
          
          // Continue conversation after placeholder
          setTimeout(() => {
            conversationController.moveToNode(activityTrigger.returnNode);
            const returnNode = conversationController.getCurrentNode();
            const continueMsg: Message = {
              id: Date.now().toString() + '_continue',
              type: 'message',
              content: returnNode.content || "Let's continue.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: returnNode.id
            };
            setConversationHistory(prev => [...prev, continueMsg]);
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error('Error processing user input:', error);
      // Don't expose internal errors to user
      const errorMsg: Message = {
        id: Date.now().toString() + '_error',
        type: 'message',
        content: "I didn't quite understand that. Could you rephrase?",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: conversationController.getCurrentNode().id
      };
      setConversationHistory(prev => [...prev, errorMsg]);
    }
    
    setUserInput('');
  };
  
  const handleSendMessage = (e: string) => {
    if (!e.trim()) return; 
    const currentNode = conversationController.getCurrentNode();
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'message',
      content: e,
      timestamp: new Date().toISOString(),
      isUser: true,
      nodeId: currentNode.id
    };
    setConversationHistory(prev => [...prev, newMessage]);
    setUserInput(e);
  };

  // getCurrentQuestion is now replaced by the conversation controller

  const closeAppLauncher = async () => {
    if (appsTimeout) {
      clearTimeout(appsTimeout);
      setAppsTimeout(null);
    }
    
    // Record activity completion
    if (chosenApp) {
      await conversationController.recordActivityCompletion(chosenApp.name, true);
    }
    
    setChosenApp(undefined);
    setShowAppsLauncher(false);
    setShouldAutoLaunchApp(false);
    
    // Handle return from activity
    if (activityReturnNode) {
      try {
        conversationController.moveToNode(activityReturnNode);
        const returnNode = conversationController.getCurrentNode();
        
        // Add a message for the return from activity
        const returnMessage: Message = {
          id: Date.now().toString(),
          type: 'message',
          content: returnNode.content || "Welcome back! How was that?",
          timestamp: new Date().toISOString(),
          isUser: false,
          nodeId: returnNode.id
        };
        
        setConversationHistory(prev => [...prev, returnMessage]);
        setActivityReturnNode(null);
      } catch (error) {
        console.error('Error returning from activity:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (appsTimeout) {
        clearTimeout(appsTimeout);
      }
    };
  }, [appsTimeout]);

  useEffect(() => {
    if (shouldAutoLaunchApp){
      const breathingApp = appsContext?.find((subapps)=>(subapps.name==='breathing'));
      setChosenApp(breathingApp);
      setShowAppsLauncher(true);
    }
  }, [shouldAutoLaunchApp]);

  const handleAppLaunch = (appToLaunch: AppInterface | undefined) => {
    if (!appToLaunch) {
      return;
    }
    setChosenApp(appToLaunch)
    setShowAppsLauncher(true);
  };

  const handleAudioPlay = (_messageId: string) => {
    toast.success('Playing voice message...', {
      description: 'Audio: "I need to take a break and relax"',
    });
  };

  const handleVoiceInput = () => {
    toast.info('Voice input activated');
  };

  const handleAccessibility = () => {
    toast.info('Accessibility options');
  };

  const handleSettings = () => {
    toast.info('Opening settings');
  };

  // Demo red alert handler
  const handleDemoAlert = () => {
    console.log('🚨 Demo red alert triggered');
    setShowAlertButton(false);
    
    // Switch to alert mode
    conversationController.switchToAlertMode();
    const alertNode = conversationController.getCurrentNode();
    
    // Clear current conversation and show alert message
    setConversationHistory([{
      id: Date.now().toString(),
      type: 'message',
      content: alertNode.content || "App launched after alert. You're not alone.",
      timestamp: new Date().toISOString(),
      isUser: false,
      nodeId: alertNode.id
    }]);
    
    // Start 3-minute timer
    setAlertTimer(180); // 3 minutes in seconds
    
    const interval = setInterval(() => {
      setAlertTimer(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          // Timer finished
          clearInterval(interval);
          
          // Show all clear message
          const allClearMsg: Message = {
            id: Date.now().toString(),
            type: 'message',
            content: "Look at that, we made it! It's safe to leave the protected space whenever you feel ready.",
            timestamp: new Date().toISOString(),
            isUser: false,
            nodeId: 'alert_all_clear'
          };
          setConversationHistory(prev => [...prev, allClearMsg]);
          
          // Reset after a delay
          setTimeout(() => {
            setShowAlertButton(true);
            conversationController.reset();
            const initialNode = conversationController.getCurrentNode();
            setConversationHistory([{
              id: Date.now().toString(),
              type: 'message',
              content: initialNode.content || "Hello! I'm here with you.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: initialNode.id
            }]);
          }, 5000);
          
          return null;
        }
      });
    }, 1000);
    
    setAlertInterval(interval);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (alertInterval) {
        clearInterval(alertInterval);
      }
    };
  }, [alertInterval]);

  const isConversationComplete = conversationController.isComplete();

  // Don't render if conversation is complete and no activities are shown
  if (isConversationComplete && !showAppsLauncher && !conversationController.isInOnboarding()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Conversation Complete</h2>
          <p className="text-gray-600 mb-4">Thank you for using CALMe. Take care!</p>
          <Button onClick={() => {
            conversationController.reset();
            const initialNode = conversationController.getCurrentNode();
            setConversationHistory([{
              id: Date.now().toString(),
              type: 'message',
              content: initialNode.content || "Hello! I'm here with you.",
              timestamp: new Date().toISOString(),
              isUser: false,
              nodeId: initialNode.id
            }]);
          }}>
            Start New Conversation
          </Button>
        </div>
      </div>
    )
  }
  return (
    <>
      <AppsProvider value={InnerApps}>
        <Toaster />
        <div 
        className="flex flex-col h-screen w-full mx-0 bg-background border-x border-border"
        >
        {/* Fixed Header */}
        <header 
        className="flex-shrink-0 flex z-1000 items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-large">CALMe</h1>
              <AlertTimer timeRemaining={alertTimer} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showAlertButton && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDemoAlert}
                className="bg-red-600 hover:bg-red-700"
              >
                Demo - RED ALERT
              </Button>
            )}
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
        {!showAppsLauncher &&
        <ScrollArea ref={scrollAreaRef} 
        className="flex-1 overflow-y-auto px-4"
        >
          <div className="space-y-4 pb-4 mt-2">
            {conversationHistory.map((message, index) => (
              <>
              <ChatMessage
                key={index}
                id={message.id}
                type={message.type}
                content={`${message.content}`}
                timestamp={message.timestamp}
                isUser={message.isUser}
                appsTypes={message.appsTypes}
                audioDuration={message.audioDuration}
                onAppLaunch={handleAppLaunch}
                onAudioPlay={handleAudioPlay}
              />
              </>
            ))}
          </div>
        </ScrollArea>
        }
        
        {showAppsLauncher && (
        <AppLauncer chosenApp={chosenApp} onClose={closeAppLauncher} />
        )}

        {shouldAutoLaunchApp && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#fef3c7', 
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              color: '#92400e'
            }}>
              <strong>High stress detected.</strong> A breathing exercise will launch automatically to help you calm down.
            </div>
          )}
        {/* Fixed Footer - Chat Input */}
        <div 
        className="fixed z-1000 bottom-0 flex flex-col w-full mx-auto bg-background border-t self-center"
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            onVoiceInput={handleVoiceInput}
          />
        </div>
        </div>
        </AppsProvider>
    </>
  )
}

export default App