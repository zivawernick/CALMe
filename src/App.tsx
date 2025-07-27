import { useState, useEffect, useRef, useContext } from 'react'
import './App.css'
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./chat_interface/ui/avatar";
import { Button } from "./chat_interface/ui/button";
import { MoreVertical, Settings, Accessibility } from "lucide-react";
import { toast, Toaster } from "sonner";
import { classifySafety, classifyStress, extractLocation } from './parser/semanticParser';
import { AppsContext, AppsProvider, InnerApps, type AppInterface } from './appsContextApi';
import AppLauncer from './AppLauncher/AppLauncer';
import { ConversationController } from './conversation/ConversationController';

// Parser result interfaces

interface ClassificationResult {
  type: 'classification';
  category: string;
  confidence: number;
  reasoning?: string;
}

interface ExtractionResult {
  type: 'extraction';
  extractedValue: string;
  confidence: number;
  informationType: string;
  extractionMethod?: string;
}

// Chat Interface
interface Message {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: ClassificationResult | ExtractionResult | string | null,
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
  audioDuration?: number;
  nodeId: string;
  result: ClassificationResult| ExtractionResult | null;
}

// Conversation is now handled by ConversationController

function App() {
  const [conversationController] = useState(() => new ConversationController());
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<ClassificationResult | ExtractionResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>(() => {
    const initialNode = conversationController.getCurrentNode();
    return [{
      id: Date.now().toString(),
      type: 'message',
      content: initialNode.content || "Hello! I'm here with you.",
      timestamp: new Date().toISOString(),
      isUser: false,
      nodeId: initialNode.id,
      result: null,
    }];
  }); 
  const [showAppsLauncher, setShowAppsLauncher] = useState(false);
  const [shouldAutoLaunchApp, setShouldAutoLaunchApp] = useState(false);
  const [chosenApp, setChosenApp] = useState<AppInterface | undefined>();
  const [appsTimeout, setAppsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activityReturnNode, setActivityReturnNode] = useState<string | null>(null);

  const appsContext = useContext(AppsContext);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    if (userInput !== '') {
      getResult();
    }
  }, [conversationHistory]);
  
  useEffect(() => {
    if (!result) {
      return;
    }
    
    try {
      const currentNode = conversationController.getCurrentNode();
      const isEndNode = conversationController.isComplete();
      
      // Determine message type based on context
      let msgType: 'message' | 'app-buttons' = 'message';
      if (currentNode.type === 'question' && !isEndNode && !showAppsLauncher) {
        // Show app buttons for certain stress-related nodes
        const shouldShowButtons = currentNode.id.includes('ongoing_support') || 
                                 currentNode.id.includes('stress') ||
                                 currentNode.id.includes('breathing_return') ||
                                 currentNode.id.includes('grounding_return');
        msgType = shouldShowButtons ? 'app-buttons' : 'message';
      }
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: msgType,
        content: currentNode.content || "How can I help you?",
        timestamp: new Date().toISOString(),
        isUser: false,
        nodeId: currentNode.id,
        result: result,
      };

      const newHistory = [...conversationHistory, newMessage];
      setConversationHistory(newHistory);
      
    } catch (error) {
      console.error('Error updating conversation:', error);
    }

  }, [result, conversationController]);

  const getResult = () => {
    if (!userInput.trim()) return; 
    
    try {
      // Get current parser type from conversation controller
      const parserType = conversationController.getCurrentParserType();
      if (!parserType) {
        console.warn('No parser type specified for current node');
        return;
      }

      // Run appropriate parser based on current node
      let stepResult: ClassificationResult | ExtractionResult;
      
      if (parserType === 'classifySafety') {
        const semanticResult = classifySafety(userInput);
        stepResult = {
          type: 'classification',
          category: semanticResult.category,
          confidence: semanticResult.confidence,
          reasoning: semanticResult.reasoning
        };
      } else if (parserType === 'classifyStress') {
        const semanticResult = classifyStress(userInput);
        stepResult = {
          type: 'classification',
          category: semanticResult.category,
          confidence: semanticResult.confidence,
          reasoning: semanticResult.reasoning
        };
      } else if (parserType === 'extractLocation') {
        const semanticResult = extractLocation(userInput);
        stepResult = {
          type: 'extraction',
          extractedValue: semanticResult.extractedValue,
          confidence: semanticResult.confidence,
          informationType: 'location',
          extractionMethod: semanticResult.extractionMethod
        };
      } else {
        // Default classification for general responses
        const semanticResult = classifyStress(userInput);
        stepResult = {
          type: 'classification',
          category: semanticResult.category,
          confidence: semanticResult.confidence,
          reasoning: semanticResult.reasoning
        };
      }
      
      setResult(stepResult);
      
      // Process with conversation controller
      const { activityTrigger } = conversationController.processParserOutput(stepResult);
      
      // Handle activity trigger
      if (activityTrigger) {
        setActivityReturnNode(activityTrigger.returnNode);
        const targetApp = appsContext?.find((app) => app.name === activityTrigger.activityName);
        if (targetApp) {
          setChosenApp(targetApp);
          setShouldAutoLaunchApp(true);
          const timer = setTimeout(() => {
            setShowAppsLauncher(true);
          }, 1500);
          setAppsTimeout(timer);
        }
      }
      
    } catch (error) {
      console.error('Error processing user input:', error);
      toast.error('Something went wrong processing your message');
    }
    
    setUserInput('');
  };
  
  const handleSendMessage = (e:any) => {
    if (!e.trim()) return; 
    const currentNode = conversationController.getCurrentNode();
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'message',
      content: e,
      timestamp: new Date().toISOString(),
      isUser: true,
      nodeId: currentNode.id,
      result: null,
    };
    const newHistory = [...conversationHistory, newMessage];
    setConversationHistory(newHistory);
    setUserInput(e);
  };

  // getCurrentQuestion is now replaced by the conversation controller

  const closeAppLauncher = () => {
    if (appsTimeout) {
      clearTimeout(appsTimeout);
      setAppsTimeout(null);
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
          nodeId: returnNode.id,
          result: null,
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

  const isConversationComplete = conversationController.isComplete();

  // Don't render if conversation is complete and no activities are shown
  if (isConversationComplete && !showAppsLauncher) {
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
              nodeId: initialNode.id,
              result: null,
            }]);
            setResult(null);
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
            <div>
              <h1 className="text-xl font-large">CALMe</h1>
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