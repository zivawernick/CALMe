import { useState, useEffect, useRef, type JSXElementConstructor, type ReactElement } from 'react'
import './App.css'
import { ChatMessage } from "./chat_interface/ChatMessage";
import { ChatInput } from "./chat_interface/ChatInput";
import { ScrollArea } from "./chat_interface/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./chat_interface/ui/avatar";
import { Button } from "./chat_interface/ui/button";
import { MoreVertical, Settings, Accessibility } from "lucide-react"; // Icon TODO - CHANGE
import { toast } from "sonner"; // pop up notifications
import './styles/globals.css';
// import BreathingExercise from './breathing_module/BreathingExercise';
import { classifySafety, classifyStress, extractLocation } from './nlp/semanticParser';
import { AppsContext, AppsProvider, InnerApps, type AppInterface } from './appsContextApi';
import AppLauncer from './AppLauncher/AppLauncer';
// import { Theme, ThemePanel } from "@radix-ui/themes";
// import {AppsConsumer} from './appsContextApi'


// Parser interface

interface ClassificationQuestion {
  id: string;
  type: 'classification';
  question: string;
  categories: {
    [key: string]: {
      keywords: string[];
      sampleInputs: string[];
    };
  };
  clarificationResponse: string;
  defaultCategory: string;
}

interface ExtractionQuestion {
  id: string;
  type: 'extraction';
  question: string;
  extractTo: string;
  informationType: string;
  validationRules?: string;
}

interface ClassificationResult {
  type: 'classification';
  category: string;
  confidence: number;
  matchedKeywords: string[];
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

// interface App {
//   type: 'breathing' | 'stretching' | 'matching-cards' | 'sudoku' | 'puzzle' | 'paint';
//   label: string;
// }

interface Message {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
  audioDuration?: number;
}

// Parser Classifications

const SAFETY_ASSESSMENT: ClassificationQuestion = {
  id: 'SAFETY_CHECK_1',
  type: 'classification',
  question: "First, I need to understand if you're safe right now. Can you tell me about your current situation?",
  categories: {
    SAFE: {
      keywords: ['safe', 'shelter', 'home', 'okay', 'secure', 'protected', 'indoors', 'building', 'bunker'],
      sampleInputs: ["Yes I'm safe", "I'm in the shelter now", "I'm at home", "We're okay here"]
    },
    DANGER: {
      keywords: ['help', 'trapped', 'sirens', 'scared', 'attack', 'bombs', 'rockets', 'danger', 'emergency', 'outside'],
      sampleInputs: ["Help! I'm trapped", "Still hearing sirens", "Rockets are falling", "I'm in danger"]
    },
    UNSURE: {
      keywords: ['not sure', 'maybe', 'think so', 'unclear', 'confused', 'dont know', "don't know"],
      sampleInputs: ["Not sure if I'm safe", "I think so", "Maybe", "I don't know"]
    }
  },
  clarificationResponse: "I need to understand if you're in immediate danger or if you're in a safe location. Can you tell me: Are you indoors in a protected space, or are you still exposed to danger?",
  defaultCategory: 'UNSURE'
};

const STRESS_ASSESSMENT: ClassificationQuestion = {
  id: 'STRESS_ASSESSMENT_1',
  type: 'classification',
  question: "I'd like to understand how you're feeling right now. Can you tell me what's going on in your body and mind?",
  categories: {
    HIGH_STRESS: {
      keywords: ['panic', "can't breathe", 'shaking', 'racing heart', 'spinning', 'overwhelming', "can't think", 'dying', 'losing control'],
      sampleInputs: ["I can't breathe", "Everything is spinning", "I feel like I'm dying"]
    },
    MODERATE_STRESS: {
      keywords: ['worried', 'anxious', 'tense', 'upset', 'scared', 'nervous', 'uncomfortable', 'stressed'],
      sampleInputs: ["I'm really worried", "Feeling tense", "Pretty scared right now"]
    },
    LOW_STRESS: {
      keywords: ['okay', 'fine', 'managing', 'stable', 'calm', 'better', 'under control', 'alright'],
      sampleInputs: ["I'm okay", "Feeling more stable", "Things are manageable"]
    }
  },
  clarificationResponse: "I want to make sure I understand how you're feeling. Can you tell me more specifically about what you're experiencing right now - either what's happening in your body (like your breathing, heart rate, or physical sensations) or what's going through your mind?",
  defaultCategory: 'MODERATE_STRESS'
};

const LOCATION_EXTRACTION: ExtractionQuestion = {
  id: 'LOCATION_EXTRACTION_1',
  type: 'extraction',
  question: "Where are you right now? This helps me understand your situation better.",
  extractTo: 'current_location',
  informationType: 'location'
};

// Parser functions

function classifyTextSemantic(text: string, question: ClassificationQuestion): ClassificationResult {
  // Use semantic parsing based on question type
  let semanticResult;
  
  if (question.id === 'SAFETY_CHECK_1') {
    semanticResult = classifySafety(text);
  } else if (question.id === 'STRESS_ASSESSMENT_1') {
    semanticResult = classifyStress(text);
  } else {
    // Fallback for unknown question types
    return {
      type: 'classification',
      category: question.defaultCategory,
      confidence: 0.5,
      matchedKeywords: [],
      reasoning: 'Unknown question type'
    };
  }
  
  return {
    type: 'classification',
    category: semanticResult.category,
    confidence: semanticResult.confidence,
    matchedKeywords: [], // Semantic parsing doesn't use keywords
    reasoning: semanticResult.reasoning
  };
}

function extractInformationSemantic(text: string, question: ExtractionQuestion): ExtractionResult {
  if (question.informationType === 'location') {
    const locationResult = extractLocation(text);
    return {
      type: 'extraction',
      extractedValue: locationResult.extractedValue,
      confidence: locationResult.confidence,
      informationType: question.informationType,
      extractionMethod: locationResult.extractionMethod
    };
  }
  
  // Fallback for other extraction types
  return {
    type: 'extraction',
    extractedValue: text.trim(),
    confidence: 0.5,
    informationType: question.informationType,
    extractionMethod: 'Direct text'
  };
}

type ConversationStep = 'safety' | 'location' | 'stress' | 'complete';

function App() {
  const [currentStep, setCurrentStep] = useState<ConversationStep>('safety');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<ClassificationResult | ExtractionResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{step: ConversationStep, result: any}>>([]);
  const [showAppsLauncher, setShowAppsLauncher] = useState(false);
  const [shouldAutoLaunchApp, setShouldAutoLaunchApp] = useState(false);
  const [chosenApp, setChosenApp] = useState<AppInterface | undefined>();
  const [appsTimeout, setAppsTimeout] = useState<NodeJS.Timeout | null>(null);
  

  const handleSubmit = () => {
    // TODO: merged with handleSendMessage
    if (!userInput.trim()) return;
    
    let stepResult: ClassificationResult | ExtractionResult;
    
    if (currentStep === 'safety') {
      stepResult = classifyTextSemantic(userInput, SAFETY_ASSESSMENT);
      setResult(stepResult);
      
      // Update conversation history
      const newHistory = [...conversationHistory, {step: currentStep, result: stepResult}];
      setConversationHistory(newHistory);
      
      // Determine next step based on safety result
      const safetyResult = stepResult as ClassificationResult;
      if (safetyResult.category === 'SAFE') {
        setCurrentStep('location');
      } else if (safetyResult.category === 'DANGER') {
        setCurrentStep('complete'); // In real app, would trigger emergency protocol
      } else {
        // UNSURE - could ask clarification or proceed to location
        setCurrentStep('location');
      }
      
    } else if (currentStep === 'location') {
      stepResult = extractInformationSemantic(userInput, LOCATION_EXTRACTION);
      setResult(stepResult);
      
      // Update conversation history
      const newHistory = [...conversationHistory, {step: currentStep, result: stepResult}];
      setConversationHistory(newHistory);
      
      // Move to stress assessment
      setCurrentStep('stress');
      
    } else if (currentStep === 'stress') {
      stepResult = classifyTextSemantic(userInput, STRESS_ASSESSMENT);
      setResult(stepResult);
      
      // Update conversation history
      const newHistory = [...conversationHistory, {step: currentStep, result: stepResult}];
      setConversationHistory(newHistory);
      
      // Check if user is highly stressed and trigger breathing exercise
      const stressResult = stepResult as ClassificationResult;
      if (stressResult.category === 'HIGH_STRESS') {
        setShouldAutoLaunchApp(true);
        console.log('High stress detected, setting breathing timer...');
        // Launch breathing exercise immediately
        const timer = setTimeout(() => {
          console.log('Breathing timer fired, launching exercise...');
          setShowAppsLauncher(true);
          console.log('setShowAppsLauncher(true) called');
        }, 1500);
        setAppsTimeout(timer);
      }
      
      setCurrentStep('complete');
    }
    
    // Clear input for next question
    setUserInput('');
  };
    

  const getCurrentQuestion = () => {
    switch (currentStep) {
      case 'safety': return SAFETY_ASSESSMENT;
      case 'location': return LOCATION_EXTRACTION;
      case 'stress': return STRESS_ASSESSMENT;
      default: return null;
    }
  };

  const resetConversation = () => {
    // Clear any pending breathing timer
    if (appsTimeout) {
      clearTimeout(appsTimeout);
      setAppsTimeout(null);
    }
    setCurrentStep('safety');
    setUserInput('');
    setResult(null);
    setConversationHistory([]);
    setShouldAutoLaunchApp(false);
  };

  // const launchInnerApps = () => {
  //   // TODO: Replace with handleAppLaunch
  //   setShowAppsLauncher(true);

  // };

  const closeAppLauncher = () => {
    // Clear any pending breathing timer
    if (appsTimeout) {
      clearTimeout(appsTimeout);
      setAppsTimeout(null);
    }
    setShowAppsLauncher(false);
    setShouldAutoLaunchApp(false);
  };

  // Cleanup breathing timer on component unmount
  useEffect(() => {
    return () => {
      if (appsTimeout) {
        clearTimeout(appsTimeout);
      }
    };
  }, [appsTimeout]);

  // Debug showAppsLauncher state changes
  useEffect(() => {
    console.log('showAppsLauncher state changed to:', showAppsLauncher);
  }, [showAppsLauncher]);



/////////////////////////////////////////


  const [messages, setMessages] = useState<Message[]>([
    // These are all messages in the chat
    // TODO: change content to be defined be the user ingut or parser's result
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
      appsTypes: 'activities',
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
      appsTypes: 'games',
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
      
      // Randomly suggest either activities or games, never both
      // TODO: remove suggestionTypes
      const suggestionTypes = [
        { apps: 'activities', message: 'Try some wellness activities:' },
        { apps: 'games', message: 'How about some fun games:' },
      ] as const;
      
      // TODO: Not Random, AI desicion
      const randomSuggestion = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
      
      // TODO: replace with a response builder
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
          appsTypes: randomSuggestion.apps, // TODO : redefine
        },
      ];
      
      responses.forEach((response, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, response]);
        }, index * 1000);
      });
    }, 1000);
  };

  const handleAppLaunch = (appToLaunch: AppInterface | undefined) => {
    if (!appToLaunch) {
      console.log('No app to launch');
      return;
    }
    // TODO: define the parser here
    setChosenApp(appToLaunch)
    setShowAppsLauncher(true);
    // Simulate app launch
    console.log(`Launching activity: ${appToLaunch.name}`);
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


  const currentQuestionData = getCurrentQuestion();

  if (!currentQuestionData) {
    console.log("this was meant to operate inside apps");
    // TODO: create switch case statments for inner app upload.
    return <></>
  }
  return (
    <>
      {/* <Theme accentColor="crimson" grayColor="sand" radius="large" scaling="95%"> */}
      <AppsProvider value={InnerApps}>
        <div 
        className="flex flex-col h-screen w-full max-w-md mx-auto bg-background border-x border-border" // new
        >
        {/* Fixed Header */}
        <header 
        className="flex-shrink-0 flex z-1000 items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80" // new
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
        {!showAppsLauncher &&
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
                appsTypes={message.appsTypes}
                audioDuration={message.audioDuration}
                onAppLaunch={handleAppLaunch} // to activate button
                onAudioPlay={handleAudioPlay}
              />
            ))}
            {/* 
            // Josh's Summary to implement
            <div style={{ padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Conversation Summary</h3>
            {conversationHistory.map((entry, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>{entry.step.toUpperCase()}:</strong> 
                {entry.result.type === 'classification' 
                  ? ` ${entry.result.category} (${Math.round(entry.result.confidence * 100)}% confidence)`
                  : ` "${entry.result.extractedValue}" (${Math.round(entry.result.confidence * 100)}% confidence)`
                }
              </div>
            ))}
          </div>
          
          //AI appropriate pic of question to insert to {reply object}
          TODO: collect answer to message object
              {currentQuestionData.question}

          // Breating button
          TODO: insert to relevant element
              🫁 Breathing Exercise
          
          // Parsing Success assessment output
              {result && (
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #ddd', 
            borderRadius: '8px' 
          }}>
            <h3>Parsing Result</h3>
            
            {result.type === 'classification' && (
              <div>
                <p><strong>Category:</strong> {(result as ClassificationResult).category}</p>
                <p><strong>Confidence:</strong> {Math.round((result as ClassificationResult).confidence * 100)}%</p>
                <p><strong>Analysis:</strong> {(result as ClassificationResult).reasoning || 'Semantic analysis complete'}</p>
                <p style={{ marginTop: '10px', color: '#666' }}>
                  <em>Next: {
                    currentStep === 'safety' && (result as ClassificationResult).category === 'SAFE' ? 'Location extraction' :
                    currentStep === 'safety' && (result as ClassificationResult).category === 'DANGER' ? 'Emergency protocol' :
                    currentStep === 'safety' ? 'Location extraction' :
                    currentStep === 'location' ? 'Stress assessment' :
                    currentStep === 'stress' && (result as ClassificationResult).category === 'HIGH_STRESS' ? 'Breathing exercise will launch' :
                    'Conversation complete'
                  }</em>
                </p>
              </div>
            )}
            
            {result.type === 'extraction' && (
              <div>
                <p><strong>Extracted Value:</strong> "{(result as ExtractionResult).extractedValue}"</p>
                <p><strong>Information Type:</strong> {(result as ExtractionResult).informationType}</p>
                <p><strong>Confidence:</strong> {Math.round((result as ExtractionResult).confidence * 100)}%</p>
                <p><strong>Method:</strong> {(result as ExtractionResult).extractionMethod || 'Direct extraction'}</p>
                <p style={{ marginTop: '10px', color: '#666' }}>
                  <em>Next: Stress assessment</em>
                </p>
              </div>
            )}
          </div>
        )}


          */}
          </div>
        
        </ScrollArea>
        }
        {showAppsLauncher && (
          // Change To AppLauncher
        <AppLauncer chosenApp={chosenApp} onClose={closeAppLauncher} />
          // <BreathingExercise 
          //   onClose={closeBreathing}
          //   onComplete={closeBreathing}
          // />
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
        className="flex-shrink-0 fixed z-1000 bottom-0 left-0 border-t  bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80" //new
        >
          <ChatInput
          // TODO: make sure all submits are handles via one handler
            onSendMessage={handleSendMessage}
            // onSendMessage={handleSubmit}
            onVoiceInput={handleVoiceInput}
            // onAddAttachment={handleAddAttachment}
          />
        </div>
        </div>
        </AppsProvider>
      {/* </Theme> */}
    </>
  )
}


export default App
