# NLPParser Specification

## Overview
This specification defines the requirements for replacing the NLPParser class in the CALMe conversation system. The parser must work as part of a fully offline mobile app on modern hardware.

## MUST REQUIREMENTS

### Core Function
The parser must **classify text into categories** and **extract information from text** based on the current conversation context.

### Required Methods (Called by ConversationController)

#### 1. `classifyInput(userInput: string, questionData: QuestionData): ClassificationResult`
**Purpose:** Classify user text into one of the available categories for the current question.

**Input:**
- `userInput: string` - Raw user text input
- `questionData: QuestionData` - Current question data with available categories

**Output:**
```typescript
interface ClassificationResult {
  type: 'classification';
  category: string;           // Must be one of questionData.categories keys
  confidence: number;         // 0.0-1.0
  matchedKeywords: string[];  // Array of matched keywords
  nlpAnalysis: NLPAnalysis;  // Linguistic analysis results
  reasoning: string;         // Human-readable explanation
  alternativeScores: CategoryScore[]; // Other category scores
}
```

#### 2. `extractInformation(userInput: string, questionData: QuestionData): ExtractionResult`
**Purpose:** Extract specific information from user text based on the question type.

**Input:**
- `userInput: string` - Raw user text input
- `questionData: QuestionData` - Current question data with informationType

**Output:**
```typescript
interface ExtractionResult {
  type: 'extraction';
  extractedValue: string;    // Extracted information
  confidence: number;        // 0.0-1.0
  informationType: string;   // Type of information extracted
  extractionMethod: string;  // How extraction was performed
}
```

**Note:** Internal implementation methods are not specified as they are only used within the class and can be completely rewritten.

### Required Constructor
```typescript
constructor() {
  this.setupCompromiseExtensions();
}
```

### Required Interfaces

```typescript
interface QuestionData {
  id: string;                                    // Current node ID
  type: 'classification' | 'extraction';         // Question type
  question: string;                              // Current question text
  categories: Record<string, CategoryInfo>;      // Available categories
  clarificationResponse: string;                  // Default clarification text
  defaultCategory: string;                       // First available category as fallback
  informationType?: string;                      // For extraction questions
}

interface CategoryInfo {
  keywords: string[];        // Keywords for this category from Mermaid chart
  sampleInputs: string[];    // Example inputs for this category
}

interface NLPAnalysis {
  sentiment: number;         // -1.0 to 1.0 sentiment score
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
  };
  linguistic: {
    emotions: string[];
    intensifiers: string[];
    negations: boolean;
    uncertainties: string[];
    questions: string[];
    verbs: string[];
    adjectives: string[];
    length: number;
    wordCount: number;
  };
}

interface CategoryScore {
  category: string;          // Category key
  score: number;            // 0.0-1.0 score
  matchedElements: string[]; // What matched this category
}
```

### Performance Requirements
- Functions must be synchronous (no async/await)
- Functions must return results immediately
- Functions must handle any string input without throwing errors
- Functions must provide reasonable confidence scores (0.2-0.9 range)
- Must work efficiently on modern mobile hardware
- Must be fully offline (no network requests)

### Error Handling Requirements
- Functions must not throw exceptions
- Functions must return valid result objects even for invalid input
- Functions must provide fallback confidence scores (0.5) for unclear cases
- Functions must handle empty strings, null, or undefined inputs gracefully

### Dynamic Adaptation Requirements
- Must work with ANY Mermaid chart structure
- Categories are extracted dynamically from chart edges
- No hardcoded category assumptions allowed
- Parser must return categories that exist in `questionData.categories`
- When chart is updated, parser should automatically adapt
- No code changes required when chart changes

## OPTIONAL INFORMATION AVAILABLE

### Conversation Controller Instance Access
The NLPParser instance can optionally access the ConversationController instance and call:

#### Current Question Data (via `getCurrentQuestion()`)
```typescript
interface CurrentQuestionData {
  id: string;                    // Current node ID (e.g., "StressLevel", "LocationCheck")
  type: 'classification';         // Always 'classification' for question nodes
  question: string;              // Current question text (e.g., "Stress Level Assessment?")
  categories: {                  // Available categories for current node
    [categoryKey: string]: {     // Normalized category (e.g., "NO_STRESS", "HIGH_STRESS")
      keywords: string[];        // Keywords for this category from Mermaid chart
      sampleInputs: string[];    // Example inputs for this category
    };
  };
  clarificationResponse: string;  // Default clarification text
  defaultCategory: string;       // First available category as fallback
}
```

#### Navigation History (via `navigationHistory`)
```typescript
interface NavigationStep {
  from: string;        // Previous node ID
  category: string;    // Selected category
  timestamp: number;   // When navigation occurred
}
```

#### Structure Information (via `getStructureInfo()`)
```typescript
interface StructureInfo {
  totalNodes: number;           // Total nodes in chart
  totalEdges: number;          // Total edges in chart
  questionNodes: number;       // Number of question nodes
  keywordNodes: number;        // Number of keyword nodes
  currentPosition: {           // Current position in chart
    nodeId: string;           // Current node ID
    nodeType: 'question' | 'keywords' | 'unknown';
    waitingForResponse: boolean;
  };
  navigationSteps: number;     // Number of navigation steps taken
}
```

#### Current Node Information (via `getCurrentNode()`)
```typescript
interface CurrentNode {
  id: string;                  // Node ID
  type: 'question' | 'keywords';
  text: string;               // Node text content
  outgoingEdges: Edge[];      // Available paths from this node
  categories?: Map<string, CategoryData>; // For question nodes
  keywords?: string[];        // For keyword nodes
}
```

#### Action Triggers (via `shouldTriggerAction()`)
- `'LAUNCH_BREATHING'` - When current node contains "breathing app"
- `'SHOW_ACTIVITIES'` - When current node contains "activities"  
- `'EMERGENCY_PROTOCOL'` - When current node contains "emergency"
- `null` - No action triggered

#### Completion Status (via `isComplete()`)
- `true` - When current node text contains "complete" or "conversation complete"
- `false` - Otherwise

#### Chart File Path (via `scriptPath`)
- Path to the current Mermaid chart file
- Can be used to reload or analyze the chart structure

### Integration Options
The NLPParser can access this information through:
1. **Direct method calls** to conversation controller instance (if made available)
2. **Global state access** if conversation controller is made globally available
3. **Context injection** if conversation controller is passed to parser methods
4. **File system access** to read the Mermaid chart directly

### Recommended Integration Approach
- Parser can access `getCurrentQuestion()` to get available categories
- Parser can use `getStructureInfo()` to understand chart context
- Parser can validate returned categories against `currentQuestion.categories`
- Parser can use `navigationHistory` to understand conversation flow
- Parser can use `shouldTriggerAction()` to understand expected outcomes 