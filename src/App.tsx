import { useState } from 'react'
import './App.css'

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
}

interface ExtractionResult {
  type: 'extraction';
  extractedValue: string;
  confidence: number;
  informationType: string;
}

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

function classifyText(text: string, question: ClassificationQuestion): ClassificationResult {
  const lowerText = text.toLowerCase();
  const results: Array<{ category: string; score: number; matches: string[] }> = [];
  
  for (const [category, data] of Object.entries(question.categories)) {
    const matches: string[] = [];
    let score = 0;
    
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches.push(keyword);
        score += 1;
      }
    }
    
    if (score > 0) {
      results.push({ category, score, matches });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  
  if (results.length === 0) {
    return {
      type: 'classification',
      category: question.defaultCategory,
      confidence: 0.1,
      matchedKeywords: []
    };
  }
  
  const best = results[0];
  const maxPossibleMatches = Math.max(...Object.values(question.categories).map(cat => cat.keywords.length));
  const confidence = Math.min(best.score / maxPossibleMatches, 1.0);
  
  return {
    type: 'classification',
    category: best.category,
    confidence,
    matchedKeywords: best.matches
  };
}

function extractInformation(text: string, question: ExtractionQuestion): ExtractionResult {
  const trimmedText = text.trim();
  
  if (question.informationType === 'location') {
    const locationPatterns = [
      /(?:at|in|from)\s+(.+)/i,
      /(?:home|house|apartment|building|shelter|office|school|hospital)/i,
      /(.+(?:street|st|avenue|ave|road|rd|boulevard|blvd))/i,
      /(.{2,})/
    ];
    
    for (const pattern of locationPatterns) {
      const match = trimmedText.match(pattern);
      if (match) {
        const extracted = match[1] || match[0];
        return {
          type: 'extraction',
          extractedValue: extracted.trim(),
          confidence: 0.8,
          informationType: question.informationType
        };
      }
    }
  }
  
  return {
    type: 'extraction',
    extractedValue: trimmedText,
    confidence: trimmedText.length > 2 ? 0.6 : 0.2,
    informationType: question.informationType
  };
}

type ConversationStep = 'safety' | 'location' | 'stress' | 'complete';

function App() {
  const [currentStep, setCurrentStep] = useState<ConversationStep>('safety');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<ClassificationResult | ExtractionResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{step: ConversationStep, result: any}>>([]);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    let stepResult: ClassificationResult | ExtractionResult;
    
    if (currentStep === 'safety') {
      stepResult = classifyText(userInput, SAFETY_ASSESSMENT);
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
      stepResult = extractInformation(userInput, LOCATION_EXTRACTION);
      setResult(stepResult);
      
      // Update conversation history
      const newHistory = [...conversationHistory, {step: currentStep, result: stepResult}];
      setConversationHistory(newHistory);
      
      // Move to stress assessment
      setCurrentStep('stress');
      
    } else if (currentStep === 'stress') {
      stepResult = classifyText(userInput, STRESS_ASSESSMENT);
      setResult(stepResult);
      
      // Update conversation history
      const newHistory = [...conversationHistory, {step: currentStep, result: stepResult}];
      setConversationHistory(newHistory);
      
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
    setCurrentStep('safety');
    setUserInput('');
    setResult(null);
    setConversationHistory([]);
  };

  const currentQuestionData = getCurrentQuestion();

  if (!currentQuestionData) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>CALMe Conversation Complete</h1>
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
        <button 
          onClick={resetConversation}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Start New Conversation
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>CALMe Conversation Flow</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <strong>Current Step:</strong> {currentStep.toUpperCase()} 
        <span style={{ marginLeft: '20px', color: '#666' }}>
          Progress: {conversationHistory.length + 1}/3
        </span>
      </div>

      {conversationHistory.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h4>Previous Responses:</h4>
          {conversationHistory.map((entry, index) => (
            <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>{entry.step}:</strong> 
              {entry.result.type === 'classification' 
                ? ` ${entry.result.category}`
                : ` "${entry.result.extractedValue}"`
              }
            </div>
          ))}
        </div>
      )}

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Question ({currentQuestionData.type.toUpperCase()})</h3>
        <p><strong>{currentQuestionData.question}</strong></p>
        
        {currentQuestionData.type === 'classification' && (
          <div style={{ marginTop: '15px' }}>
            <h4>Categories & Keywords:</h4>
            {Object.entries((currentQuestionData as ClassificationQuestion).categories).map(([category, data]) => (
              <div key={category} style={{ marginBottom: '10px' }}>
                <strong>{category}:</strong> {data.keywords.join(', ')}
                <br />
                <em>Examples: {data.sampleInputs.join('; ')}</em>
              </div>
            ))}
          </div>
        )}
        
        {currentQuestionData.type === 'extraction' && (
          <div style={{ marginTop: '15px' }}>
            <p><strong>Extracting:</strong> {(currentQuestionData as ExtractionQuestion).informationType}</p>
            <p><strong>Variable:</strong> {(currentQuestionData as ExtractionQuestion).extractTo}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your response here..."
          style={{ 
            width: '100%', 
            minHeight: '100px', 
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
      </div>

      <button 
        onClick={handleSubmit}
        style={{
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Submit Response
      </button>

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
              <p><strong>Matched Keywords:</strong> {(result as ClassificationResult).matchedKeywords.join(', ') || 'None'}</p>
              <p style={{ marginTop: '10px', color: '#666' }}>
                <em>Next: {
                  currentStep === 'safety' && (result as ClassificationResult).category === 'SAFE' ? 'Location extraction' :
                  currentStep === 'safety' && (result as ClassificationResult).category === 'DANGER' ? 'Emergency protocol' :
                  currentStep === 'safety' ? 'Location extraction' :
                  currentStep === 'location' ? 'Stress assessment' :
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
              <p style={{ marginTop: '10px', color: '#666' }}>
                <em>Next: Stress assessment</em>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App
