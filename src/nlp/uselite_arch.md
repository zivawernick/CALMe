# USE Lite Architecture Implementation Plan

## Overview
This document outlines the detailed implementation plan for replacing the current compromise.js-based NLPParser with Universal Sentence Encoder (USE) Lite for improved semantic understanding while maintaining offline-first operation. The new approach will use USE Lite exclusively without compromise.js dependency.

## Architecture Goals
- ✅ Fully offline operation
- ✅ Pre-calculated embeddings for performance
- ✅ Automated build-time embedding calculation
- ✅ Surgical replacement of NLPParser class
- ✅ Zero changes to external interfaces
- ✅ Support for ANY Mermaid chart structure

## CRITICAL CONSTRAINT: NO EXISTING CODE MODIFICATIONS

**⚠️ ABSOLUTE REQUIREMENT: NEVER ALTER EXISTING CODE OUTSIDE THE NLPParser CLASS**

### What This Means:
- **✅ ALLOWED**: Create new files, add new dependencies, implement new utilities
- **✅ ALLOWED**: Replace the internal implementation of NLPParser class methods
- **✅ ALLOWED**: Add new methods to NLPParser class
- **❌ FORBIDDEN**: Modify any existing code outside NLPParser class
- **❌ FORBIDDEN**: Change interfaces, function signatures, or class structures
- **❌ FORBIDDEN**: Alter ConversationController, MermaidInterpreter, or any other existing classes
- **❌ FORBIDDEN**: Modify existing function calls or import statements

### Implementation Strategy:
1. **Surgical Replacement**: Only replace the internal implementation of NLPParser methods
2. **Interface Preservation**: Maintain exact same public method signatures
3. **New File Creation**: All USE Lite code goes in new files
4. **Dependency Addition**: Add TensorFlow.js dependencies without modifying existing ones
5. **Build Process**: Add new build steps without changing existing ones

### Success Criteria:
- All existing tests pass without modification
- All existing function calls work identically
- All existing interfaces remain unchanged
- All existing imports and exports remain functional
- Zero breaking changes to the codebase

## Implementation Strategy

### 1. Build-Time Embedding Calculation

#### File Structure
```
src/nlp/
├── embeddings/
│   ├── category-embeddings.json     # Auto-generated from Mermaid charts
│   ├── embedding-model.js           # USE Lite wrapper
│   └── embedding-utils.js           # Embedding calculation utilities
├── separated_mermaid_interpreter_parser.js  # Updated NLPParser
├── separated_mermaid_interpreter_parser.d.ts
└── uselite_arch.md                  # This file

scripts/
└── calculate-embeddings.js          # Build script for embedding calculation

vite.config.ts                       # Updated with embedding plugin
```

#### Mermaid Chart Understanding
The NLP system must understand different node types in Mermaid charts:

**Diamond Nodes** (Decision Points):
```mermaid
LocationCheck{"Where are you right now?"}
```
- **Purpose**: Questions requiring user classification
- **NLP Task**: Classify user input into available categories
- **Categories**: Extracted from edge labels

**Rectangle Nodes** (Keyword Collections):
```mermaid
ModerateStress["anxious, worried, uncomfortable, tense, stressed, concerned, uneasy, nervous, apprehensive, agitated, restless, on edge, uptight, worked up, tired out, exhausted, fatigued, weary, drained, overwhelmed, struggling, fighting, battling"]
```
- **Purpose**: Define keywords for category classification
- **NLP Task**: Use keywords to understand user intent
- **Processing**: Comma-separated terms for semantic matching

**Circle Nodes** (Start/End Points):
```mermaid
Start@{ label: "Hi there. I'm here with you. Let me ask...What's your stress level like??" }
```
- **Purpose**: Conversation entry/exit points
- **NLP Task**: Usually no classification needed (system output)

**Edge Labels** (Category Names):
```mermaid
Start -- Moderate Stress --> ModerateStress
```
- **Purpose**: Define category names for classification
- **NLP Task**: Become available categories for parser

#### Embedding Calculation Process
```javascript
// scripts/calculate-embeddings.js
1. Parse all .mermaid files in project
2. Extract diamond nodes (decision points) and their edge labels (categories)
3. Extract rectangle nodes (keyword collections) for each category
4. Calculate embeddings for each category's keyword list
5. Generate category-embeddings.json with node mappings
6. Bundle with app during build

// Example processing for the provided chart:
// Diamond node: LocationCheck{"Where are you right now?"}
// Edge categories: "In Safe Space", "Moving to Safety", "Unsheltered"
// Rectangle nodes: InSafety["safe room, shelter, protected area, ..."]
// Result: Embeddings for each category's keywords
```

### 2. USE Lite Integration

#### Dependencies
```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.17.0",
    "@tensorflow-models/universal-sentence-encoder": "^1.3.3"
  }
}
// Note: Removed compromise.js dependency - USE Lite handles all NLP tasks
```

#### Model Loading Strategy
```javascript
// src/nlp/embeddings/embedding-model.js
- Load USE Lite model once during app initialization
- Cache model in memory for runtime use
- Handle loading errors gracefully with fallback
```

### 3. NLPParser Class Replacement

#### Interface Preservation
```typescript
// MAINTAIN EXACT SAME PUBLIC INTERFACE - NO CHANGES ALLOWED
class NLPParser {
  constructor();
  classifyInput(userInput: string, questionData: QuestionData): ClassificationResult;
  extractInformation(userInput: string, questionData: QuestionData): ExtractionResult;
}

// ✅ ALLOWED: Replace internal implementation of these methods
// ✅ ALLOWED: Add private helper methods to the class
// ❌ FORBIDDEN: Change method signatures, return types, or parameter types
// ❌ FORBIDDEN: Add new public methods to the interface
```

#### Internal Implementation Changes
```javascript
// NEW PRIVATE METHODS (ADDED TO NLPParser CLASS ONLY)
- embedText(text: string): Promise<number[]>  // Embed user input
- calculateSimilarity(embedding1: number[], embedding2: number[]): number
- loadPreCalculatedEmbeddings(): void  // Load category embeddings
- findBestCategoryMatch(userEmbedding: number[], categories: Record<string, CategoryInfo>): CategoryScore[]
- handleNoKeywordMatch(userInput: string, categories: Record<string, CategoryInfo>): ClassificationResult
- calculateSemanticSimilarity(userEmbedding: number[], categoryEmbeddings: Record<string, number[]>): CategoryScore[]
- fuzzyKeywordMatch(text: string, keywords: string[]): number  // Fuzzy matching
- detectLinguisticPatterns(text: string): LinguisticAnalysis  // Pattern detection
- createDescriptiveError(userInput: string, analysis: any, reason: string): ClassificationResult  // Error creation
```

// ✅ ALLOWED: Add these as private methods to NLPParser class
// ✅ ALLOWED: Create new utility files for embedding calculations
// ❌ FORBIDDEN: Modify any existing method signatures or interfaces
// ❌ FORBIDDEN: Change how other classes interact with NLPParser
```

### 4. Performance Optimization

#### No Keyword Match Handling
When user input contains no valid keywords, USE Lite will:

**Semantic Similarity Approach:**
```javascript
// Example: User says "I'm not sure how I feel"
// 1. Embed user input: "I'm not sure how I feel" → [0.123, 0.456, ...]
// 2. Compare with all category embeddings:
//    - "Moderate Stress" embedding: [0.234, 0.567, ...] → similarity: 0.45
//    - "Low Stress" embedding: [0.345, 0.678, ...] → similarity: 0.52
//    - "High Stress" embedding: [0.123, 0.456, ...] → similarity: 0.38
// 3. Check confidence threshold: 0.52 < 0.6 (semantic threshold)
// 4. Return descriptive error: "Input unclear - highest similarity 0.52 to 'Low Stress'"
```

**Confidence Thresholds:**
- **No keyword matches**: Use semantic similarity with confidence threshold
- **Semantic similarity only**: Require higher confidence threshold
- **Very low similarity**: Return descriptive error with analysis details
- **Minimum confidence threshold**: 0.4 (below this = error, not assumption)

**Fallback Strategy:**
1. **USE Lite semantic similarity** (even with no keywords)
2. **Fuzzy keyword matching** (partial matches, typos)
3. **Linguistic pattern matching** (intensifiers, negations, uncertainty)
4. **Descriptive error** with analysis details for debugging

#### Pre-calculated Embeddings Format
```json
{
  "categories": {
    "Moderate Stress": {
      "keywords": ["anxious", "worried", "uncomfortable", "tense", "stressed", "concerned", "uneasy", "nervous", "apprehensive", "agitated", "restless", "on edge", "uptight", "worked up", "tired out", "exhausted", "fatigued", "weary", "drained", "overwhelmed", "struggling", "fighting", "battling"],
      "embedding": [0.123, 0.456, ...],  // 512-dimensional vector
      "categoryName": "Moderate Stress",
      "nodeId": "ModerateStress"
    },
    "High Stress": {
      "keywords": ["very anxious", "panicked", "overwhelmed", "intense", "severe stress", "extreme worry", "high anxiety", "major concern", "significant nervousness", "substantial pressure", "heavy strain", "crushing doubt", "paralyzing concern", "crippling worry", "debilitating fear", "immobilizing tension", "shocking burden"],
      "embedding": [0.789, 0.012, ...],
      "categoryName": "High Stress",
      "nodeId": "HighStress"
    },
    "In Safe Space": {
      "keywords": ["safe room", "shelter", "protected area", "mamad", "miklat", "reinforced space", "secure location", "bomb shelter", "safe zone", "emergency shelter", "designated shelter", "approved location", "secured area"],
      "embedding": [0.345, 0.678, ...],
      "categoryName": "In Safe Space",
      "nodeId": "InSafety"
    }
  },
  "metadata": {
    "modelVersion": "1.3.3",
    "embeddingDimensions": 512,
    "calculatedAt": "2024-01-15T10:30:00Z",
    "chartSource": "conversation-flow.mermaid"
  }
}
```

#### Runtime Performance
- **User input embedding**: ~50-100ms (one-time per input)
- **Similarity calculation**: ~1-5ms per category
- **Total classification time**: ~100-200ms
- **Memory usage**: ~50MB for model + embeddings

### 5. Vite Build Integration

#### Vite Plugin Implementation
```javascript
// vite.config.ts
import { calculateEmbeddings } from './scripts/embedding-plugin.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    calculateEmbeddings({
      mermaidFiles: ['src/conversation_flows/*.mermaid'],
      outputFile: 'src/nlp/embeddings/category-embeddings.json'
    })
  ]
});
```

#### Build Process Flow
```javascript
// Automated build process
1. npm run build
2. Vite plugin triggers embedding calculation
3. Parse .mermaid files → Extract categories
4. Calculate embeddings for each category
5. Generate category-embeddings.json
6. Bundle with app
7. Deploy to app store
```

### 6. Error Handling & Fallbacks

#### Graceful Degradation
```javascript
// Fallback strategy for no keyword matches
1. Try USE Lite semantic similarity (even with no exact keyword matches)
2. If semantic similarity is too low → Use fuzzy keyword matching
3. If fuzzy matching fails → Use linguistic pattern matching
4. If all else fails → Return descriptive error for debugging

// Example: User says "I'm not sure how I feel"
// - No exact keyword matches found
// - USE Lite calculates semantic similarity to all categories
// - If similarity is too low → Return error with analysis details
// - Never assume user intent - always require valid input
```

#### Error Scenarios
- **Model loading fails**: Return descriptive error with model loading details
- **Embedding calculation fails**: Return error with calculation failure details
- **No pre-calculated embeddings**: Return error with embedding loading details
- **Invalid input**: Return error with input validation details
- **No keyword matches**: Return error with similarity analysis details
- **Ambiguous input**: Return error with multiple category analysis
- **Completely unrelated input**: Return error with semantic analysis details
- **Low confidence across all methods**: Return error with confidence breakdown

### 7. Memory Management

#### Model Loading Strategy
```javascript
// Singleton pattern for model
let useModel = null;
let embeddings = null;

async function loadModel() {
  if (!useModel) {
    useModel = await load('@tensorflow-models/universal-sentence-encoder');
  }
  return useModel;
}
```

#### Memory Optimization
- **Lazy loading**: Model loaded only when needed
- **Caching**: Embeddings cached in memory
- **Cleanup**: TensorFlow.js memory management
- **Bundle splitting**: Model loaded separately from main app

### 8. Testing Strategy

#### Unit Tests
```javascript
// Test cases
- classifyInput with various user inputs
- extractInformation for different question types
- Error handling for invalid inputs
- Performance benchmarks
- Memory usage monitoring
```

#### Integration Tests
```javascript
// End-to-end tests
- Full conversation flow with USE Lite
- Chart updates trigger embedding recalculation
- App store deployment with new embeddings
```

### 9. Migration Plan

#### Phase 1: Preparation
1. Add TensorFlow.js dependencies
2. Create embedding calculation scripts
3. Update Vite configuration
4. Add fallback mechanisms

#### Phase 2: Implementation
1. Implement USE Lite wrapper
2. Replace NLPParser internal methods
3. Add pre-calculated embedding loading
4. Implement similarity calculation

#### Phase 3: Testing
1. Unit tests for new implementation
2. Performance testing
3. Memory usage validation
4. Error handling verification

#### Phase 4: Deployment
1. Build with new embeddings
2. Test on target devices
3. Monitor performance metrics
4. Deploy to app stores

### 10. Bundle Size Impact

#### Estimated Sizes
- **TensorFlow.js**: ~1.2MB
- **USE Lite model**: ~1.0MB
- **Pre-calculated embeddings**: ~0.1MB
- **Removed compromise.js**: ~-0.5MB (savings)
- **Total increase**: ~1.8MB (net increase)

#### Optimization Strategies
- **Code splitting**: Load model separately
- **Tree shaking**: Remove unused TensorFlow.js features
- **Compression**: Gzip compression for embeddings
- **Lazy loading**: Model loaded on demand

### 11. Hardware Requirements

#### Development
- **CPU**: Any modern multi-core processor
- **RAM**: 8GB+ recommended
- **Storage**: 2GB+ free space for model downloads

#### Runtime (Mobile)
- **iOS**: iOS 12+ with 2GB+ RAM
- **Android**: Android 8+ with 2GB+ RAM
- **Performance**: Modern mobile processors handle USE Lite well

### 12. Monitoring & Analytics

#### Performance Metrics
- Model loading time
- Classification response time
- Memory usage
- Accuracy rates
- Error rates

#### Debug Information
```javascript
// Debug output for troubleshooting
{
  modelLoaded: boolean,
  embeddingTime: number,
  classificationTime: number,
  memoryUsage: number,
  fallbackUsed: boolean
}
```

## Success Criteria

### Functional Requirements
- ✅ All existing tests pass without modification
- ✅ No changes to external interfaces or function signatures
- ✅ Works with any Mermaid chart structure
- ✅ Fully offline operation
- ✅ Automated embedding calculation
- ✅ Zero breaking changes to existing codebase
- ✅ All existing function calls work identically
- ✅ Descriptive errors instead of hardcoded assumptions
- ✅ No system-derived behavior divorced from user input

### Performance Requirements
- ✅ Classification time < 200ms
- ✅ Memory usage < 100MB
- ✅ Bundle size increase < 3MB
- ✅ Model loading time < 5 seconds

### Quality Requirements
- ✅ 95%+ accuracy on test cases
- ✅ Graceful error handling
- ✅ Comprehensive logging
- ✅ Performance monitoring

## Risk Mitigation

### Technical Risks
- **Model loading failures**: Robust fallback system
- **Memory issues**: Proper cleanup and monitoring
- **Performance degradation**: Benchmarking and optimization
- **Bundle size**: Code splitting and compression

### Operational Risks
- **Build process complexity**: Automated scripts and documentation
- **Deployment issues**: Comprehensive testing
- **User experience**: Performance monitoring and optimization

## Detailed Implementation Timeline

### Week 1: Setup and Basic Implementation

#### Days 1-2: Foundation Setup
- **Add TensorFlow.js dependencies** to `package.json`
- **Create embedding calculation scripts** (`scripts/calculate-embeddings.js`)
- **Set up Vite plugin** for automated embedding calculation
- **Create embedding utilities** (`src/nlp/embeddings/embedding-utils.js`)
- **Test basic USE Lite model loading** and embedding generation

#### Days 3-4: Core Infrastructure
- **Implement embedding model wrapper** (`src/nlp/embeddings/embedding-model.js`)
- **Create pre-calculated embedding format** and JSON structure
- **Build embedding calculation pipeline** that parses Mermaid charts
- **Test embedding calculation** with sample charts

#### Days 5-7: Basic Integration
- **Create fallback mechanisms** (fuzzy keyword matching)
- **Implement basic similarity calculation** functions
- **Test model loading** and error handling
- **Validate memory usage** and performance

### Week 2: Integration and Testing

#### Days 1-3: NLPParser Replacement
- **Replace internal implementation** of methods in `separated_mermaid_interpreter_parser.js`
- **Implement `classifyInput`** with USE Lite + similarity scoring (same interface)
- **Implement `extractInformation`** with semantic extraction (same interface)
- **Add pre-calculated embedding loading** logic as private methods
- **Maintain exact same interface** - zero external changes allowed
- **Verify all existing function calls** still work identically

#### Days 4-5: Performance Optimization
- **Optimize embedding calculation** speed
- **Implement caching strategies** for model and embeddings
- **Add memory management** and cleanup
- **Benchmark performance** against current keyword matching

#### Days 6-7: Error Handling & Fallbacks
- **Implement comprehensive error handling**
- **Test fallback scenarios** (model loading fails, etc.)
- **Add graceful degradation** mechanisms
- **Validate edge cases** and error conditions

### Week 3: Optimization and Deployment

#### Days 1-3: Testing & Validation
- **Unit tests** for all new functionality
- **Integration tests** with existing conversation flows
- **Performance testing** on target devices
- **Memory usage validation** and optimization
- **Accuracy testing** with various input types

#### Days 4-5: Build Process Integration
- **Finalize Vite plugin** for automated embedding calculation
- **Test complete build process** end-to-end
- **Validate bundle size** and optimization
- **Test chart updates** trigger embedding recalculation

#### Days 6-7: Deployment Preparation
- **Documentation** and code comments
- **Performance monitoring** setup
- **Final testing** on target platforms
- **Deployment scripts** and procedures

### Week 4: Final Testing and Deployment

#### Days 1-3: Comprehensive Testing
- **Cross-platform testing** (iOS/Android)
- **Performance regression** testing
- **Memory leak** identification and fixing
- **Edge case** discovery and resolution
- **User acceptance testing**

#### Days 4-5: Bug Fixes and Optimization
- **Address performance issues** identified in testing
- **Fix memory management** problems
- **Optimize bundle size** and loading times
- **Refine error handling** based on test results

#### Days 6-7: Deployment and Monitoring
- **Final deployment** to app stores
- **Performance monitoring** setup
- **User feedback** collection
- **Documentation** completion

## Risk Factors and Mitigation

### Technical Risks
- **TensorFlow.js complexity** - New technology for the team
  - *Mitigation*: Start with basic examples, incremental implementation
- **Mobile performance** - Harder to optimize than web
  - *Mitigation*: Early performance testing, optimization focus
- **Memory constraints** - Mobile devices have limited RAM
  - *Mitigation*: Memory monitoring, cleanup strategies
- **Build process** - Automated embedding calculation complexity
  - *Mitigation*: Thorough testing, fallback mechanisms

### Success Factors
- **Familiarity with TensorFlow.js** - Reduces learning curve
- **Good test coverage** - Catches issues early
- **Incremental approach** - Implement and test in phases
- **Performance monitoring** - Identify bottlenecks quickly

## Conservative Timeline: 4 Weeks

### Recommended Approach
- **Week 1-2**: Core implementation and basic integration
- **Week 3**: Testing, optimization, and deployment prep
- **Week 4**: Final testing, bug fixes, and deployment

### Buffer Time Allocation
- **Week 1**: +2 days for TensorFlow.js learning curve
- **Week 2**: +2 days for performance optimization
- **Week 3**: +2 days for comprehensive testing
- **Week 4**: +2 days for bug fixes and final deployment

### Total: 4 weeks with buffer for unexpected challenges

## Conclusion

This architecture provides a robust, scalable solution for semantic understanding in the CALMe conversation system while maintaining the offline-first approach and surgical replacement requirements. The pre-calculated embedding approach ensures optimal performance while the automated build process eliminates manual work for chart updates.

## CRITICAL IMPLEMENTATION REMINDER

**⚠️ FINAL CONSTRAINT CHECKLIST:**

Before implementing any code changes, verify:
- [ ] Only NLPParser class internal implementation is modified
- [ ] All existing interfaces remain unchanged
- [ ] All existing function calls work identically
- [ ] All existing tests pass without modification
- [ ] No existing code outside NLPParser class is altered
- [ ] New files are created for USE Lite utilities
- [ ] Dependencies are added without modifying existing ones
- [ ] Build process is enhanced without breaking existing build
- [ ] Compromise.js dependency is removed and replaced with USE Lite
- [ ] All linguistic analysis is handled by USE Lite and custom patterns
- [ ] Descriptive errors returned instead of hardcoded assumptions
- [ ] No system-derived behavior divorced from user input

**The goal is to enhance the current development with USE Lite, not replace it.** 