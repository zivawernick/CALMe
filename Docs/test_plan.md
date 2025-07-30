# CALMe Test Plan

## Overview
This test plan provides comprehensive automated and manual testing strategies for the CALMe conversation system with USE Lite NLP integration. All tests are **chart-agnostic** and dynamically adapt to any provided Mermaid chart structure.

## 1. Unit Tests (No App Build Required)

### 1.1 Mermaid Chart Parser Tests
```javascript
// tests/mermaid-parser.test.js
describe('MermaidInterpreter', () => {
  test('should parse any valid Mermaid chart structure', () => {
    const chartText = fs.readFileSync('test-charts/sample.mermaid', 'utf8');
    const interpreter = new MermaidInterpreter();
    const result = interpreter.parseMermaidSyntax(chartText);
    
    expect(result.nodes).toBeDefined();
    expect(result.edges).toBeDefined();
    expect(result.nodes.size).toBeGreaterThan(0);
  });

  test('should extract diamond nodes (decision points)', () => {
    const chartText = fs.readFileSync('test-charts/sample.mermaid', 'utf8');
    const interpreter = new MermaidInterpreter();
    const result = interpreter.parseMermaidSyntax(chartText);
    
    const diamondNodes = Array.from(result.nodes.values())
      .filter(node => node.type === 'question');
    
    expect(diamondNodes.length).toBeGreaterThan(0);
    diamondNodes.forEach(node => {
      expect(node.text).toContain('{');
      expect(node.text).toContain('}');
    });
  });

  test('should extract rectangle nodes (keyword collections)', () => {
    const chartText = fs.readFileSync('test-charts/sample.mermaid', 'utf8');
    const interpreter = new MermaidInterpreter();
    const result = interpreter.parseMermaidSyntax(chartText);
    
    const rectangleNodes = Array.from(result.nodes.values())
      .filter(node => node.type === 'keywords');
    
    expect(rectangleNodes.length).toBeGreaterThan(0);
    rectangleNodes.forEach(node => {
      expect(node.keywords).toBeDefined();
      expect(node.keywords.length).toBeGreaterThan(0);
    });
  });

  test('should extract edge categories from any chart', () => {
    const chartText = fs.readFileSync('test-charts/sample.mermaid', 'utf8');
    const interpreter = new MermaidInterpreter();
    const result = interpreter.parseMermaidSyntax(chartText);
    
    const categories = new Set();
    result.edges.forEach(edge => {
      if (edge.label) {
        categories.add(edge.label);
      }
    });
    
    expect(categories.size).toBeGreaterThan(0);
  });
});
```

### 1.2 USE Lite Embedding Tests
```javascript
// tests/use-lite.test.js
describe('USE Lite Integration', () => {
  test('should load USE Lite model', async () => {
    const model = await load('@tensorflow-models/universal-sentence-encoder');
    expect(model).toBeDefined();
  });

  test('should embed text input', async () => {
    const model = await load('@tensorflow-models/universal-sentence-encoder');
    const embeddings = await model.embed(['test input']);
    
    expect(embeddings).toBeDefined();
    expect(embeddings.shape[0]).toBe(1);
    expect(embeddings.shape[1]).toBe(512);
  });

  test('should calculate similarity between embeddings', () => {
    const embedding1 = [0.1, 0.2, 0.3, ...];
    const embedding2 = [0.1, 0.2, 0.3, ...];
    const similarity = calculateSimilarity(embedding1, embedding2);
    
    expect(similarity).toBeGreaterThanOrEqual(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });
});
```

### 1.3 Embedding Calculation Tests
```javascript
// tests/embedding-calculation.test.js
describe('Embedding Calculation', () => {
  test('should calculate embeddings for chart categories', async () => {
    const chartText = fs.readFileSync('test-charts/sample.mermaid', 'utf8');
    const categories = extractCategoriesFromChart(chartText);
    
    const embeddings = await calculateCategoryEmbeddings(categories);
    
    expect(embeddings).toBeDefined();
    Object.keys(categories).forEach(category => {
      expect(embeddings[category]).toBeDefined();
      expect(embeddings[category].length).toBe(512);
    });
  });

  test('should handle empty keyword lists', async () => {
    const categories = { 'Empty': { keywords: [] } };
    const embeddings = await calculateCategoryEmbeddings(categories);
    
    expect(embeddings['Empty']).toBeDefined();
    expect(embeddings['Empty'].length).toBe(512);
  });
});
```

### 1.4 NLPParser Interface Tests
```javascript
// tests/nlp-parser.test.js
describe('NLPParser Interface', () => {
  test('should maintain exact same interface', () => {
    const parser = new NLPParser();
    
    expect(typeof parser.classifyInput).toBe('function');
    expect(typeof parser.extractInformation).toBe('function');
    expect(typeof parser.setupCompromiseExtensions).toBe('function');
  });

  test('should handle invalid input gracefully', () => {
    const parser = new NLPParser();
    const questionData = createTestQuestionData();
    
    const result = parser.classifyInput('', questionData);
    expect(result).toBeDefined();
    expect(result.type).toBe('classification');
  });
});
```

## 2. Build Instructions for Test Environment

### 2.1 Prerequisites (All Platforms)
```bash
# Install Node.js (v18+)
# Download from: https://nodejs.org/

# Install Git
# Download from: https://git-scm.com/

# Install free tools
npm install -g yarn  # Alternative package manager
npm install -g pnpm  # Fast package manager
```

### 2.2 Linux Setup
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm git

# CentOS/RHEL
sudo yum install nodejs npm git

# Build the app
git clone https://github.com/zivawernick/CALMe.git
cd CALMe
git checkout useliteNLP
npm install
npm run build
```

### 2.3 Windows Setup
```bash
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs git

# Build the app
git clone https://github.com/zivawernick/CALMe.git
cd CALMe
git checkout useliteNLP
npm install
npm run build
```

### 2.4 macOS Setup
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node git

# Build the app
git clone https://github.com/zivawernick/CALMe.git
cd CALMe
git checkout useliteNLP
npm install
npm run build
```

### 2.5 Pre-calculated Embeddings Generation
```bash
# The build process automatically generates embeddings
npm run build

# Verify embeddings were created
ls src/nlp/embeddings/category-embeddings.json

# Test embedding generation manually
node scripts/calculate-embeddings.js --test
```

## 3. Unit Tests Requiring Built App

### 3.1 USE Lite Model Integration Tests
```javascript
// tests/use-lite-integration.test.js
describe('USE Lite Model Integration', () => {
  let model;
  
  beforeAll(async () => {
    model = await load('@tensorflow-models/universal-sentence-encoder');
  });

  test('should classify input with keywords', async () => {
    const parser = new NLPParser();
    const questionData = createDynamicQuestionData();
    
    const result = await parser.classifyInput('I feel anxious', questionData);
    
    expect(result.type).toBe('classification');
    expect(result.confidence).toBeGreaterThan(0.4);
    expect(result.category).toBeDefined();
  });

  test('should handle semantic similarity without keywords', async () => {
    const parser = new NLPParser();
    const questionData = createDynamicQuestionData();
    
    const result = await parser.classifyInput('I am worried about things', questionData);
    
    expect(result.type).toBe('classification');
    expect(result.confidence).toBeGreaterThan(0.6); // Higher threshold for semantic only
  });

  test('should return descriptive error for unclear input', async () => {
    const parser = new NLPParser();
    const questionData = createDynamicQuestionData();
    
    const result = await parser.classifyInput('xyz123', questionData);
    
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Input unclear');
  });
});
```

### 3.2 Conversation Flow Tests
```javascript
// tests/conversation-flow.test.js
describe('Conversation Flow', () => {
  test('should navigate through all chart nodes', async () => {
    const controller = new ConversationController('test-charts/sample.mermaid');
    await controller.initialize();
    
    const structure = controller.getStructureInfo();
    const visitedNodes = new Set();
    
    // Navigate through all possible paths
    await navigateAllPaths(controller, visitedNodes);
    
    expect(visitedNodes.size).toBe(structure.totalNodes);
  });
});
```

## 4. Automated End-to-End Tests

### 4.1 Headless Testing Strategy

#### 4.1.1 Keyword-Based Testing
```javascript
// tests/e2e-keyword.test.js
describe('End-to-End Keyword Testing', () => {
  test('should complete conversation using keywords from chart', async () => {
    const chartPath = 'test-charts/sample.mermaid';
    const controller = new ConversationController(chartPath);
    await controller.initialize();
    
    // Dynamically read chart to get test inputs
    const testInputs = generateKeywordTestInputs(chartPath);
    
    for (const testCase of testInputs) {
      const result = await controller.processUserInput(testCase.input);
      
      expect(result.success).toBe(true);
      expect(result.classification.category).toBe(testCase.expectedCategory);
      expect(result.classification.confidence).toBeGreaterThan(0.4);
    }
  });
});

function generateKeywordTestInputs(chartPath) {
  const chartText = fs.readFileSync(chartPath, 'utf8');
  const interpreter = new MermaidInterpreter();
  const structure = interpreter.parseMermaidSyntax(chartText);
  
  const testInputs = [];
  
  // Extract keywords from rectangle nodes
  const keywordNodes = Array.from(structure.nodes.values())
    .filter(node => node.type === 'keywords');
  
  keywordNodes.forEach(node => {
    // Use first few keywords from each category
    const keywords = node.keywords.slice(0, 3);
    keywords.forEach(keyword => {
      testInputs.push({
        input: `I feel ${keyword}`,
        expectedCategory: findCategoryForNode(node.id, structure),
        nodeId: node.id
      });
    });
  });
  
  return testInputs;
}
```

#### 4.1.2 Semantic Similarity Testing
```javascript
// tests/e2e-semantic.test.js
describe('End-to-End Semantic Testing', () => {
  test('should complete conversation using semantic similarity', async () => {
    const chartPath = 'test-charts/sample.mermaid';
    const controller = new ConversationController(chartPath);
    await controller.initialize();
    
    // Generate semantic test inputs (no direct keywords)
    const testInputs = generateSemanticTestInputs(chartPath);
    
    for (const testCase of testInputs) {
      const result = await controller.processUserInput(testCase.input);
      
      expect(result.success).toBe(true);
      expect(result.classification.category).toBe(testCase.expectedCategory);
      expect(result.classification.confidence).toBeGreaterThan(0.6); // Higher threshold
    }
  });
});

function generateSemanticTestInputs(chartPath) {
  const chartText = fs.readFileSync(chartPath, 'utf8');
  const interpreter = new MermaidInterpreter();
  const structure = interpreter.parseMermaidSyntax(chartText);
  
  const testInputs = [];
  
  // Generate semantic equivalents for each category
  const semanticEquivalents = {
    'anxious': ['worried', 'nervous', 'concerned', 'uneasy'],
    'calm': ['peaceful', 'relaxed', 'serene', 'tranquil'],
    'safe': ['secure', 'protected', 'sheltered', 'guarded'],
    'danger': ['unsafe', 'threatened', 'exposed', 'vulnerable']
  };
  
  const keywordNodes = Array.from(structure.nodes.values())
    .filter(node => node.type === 'keywords');
  
  keywordNodes.forEach(node => {
    const category = findCategoryForNode(node.id, structure);
    const equivalents = semanticEquivalents[category] || [];
    
    equivalents.forEach(equivalent => {
      testInputs.push({
        input: `I am feeling ${equivalent}`,
        expectedCategory: category,
        nodeId: node.id
      });
    });
  });
  
  return testInputs;
}
```

### 4.2 GUI Automation Testing

#### 4.2.1 Playwright Setup
```javascript
// tests/gui-automation.test.js
const { test, expect } = require('@playwright/test');

test.describe('GUI Automation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should complete conversation via GUI using keywords', async ({ page }) => {
    // Start conversation
    await page.click('[data-testid="start-conversation"]');
    
    // Dynamically read chart to get test inputs
    const testInputs = await generateKeywordTestInputs();
    
    for (const testInput of testInputs) {
      // Type input
      await page.fill('[data-testid="chat-input"]', testInput.input);
      await page.click('[data-testid="send-button"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="chat-message"]');
      
      // Verify response
      const response = await page.textContent('[data-testid="chat-message"]:last-child');
      expect(response).toContain(testInput.expectedResponse);
    }
  });

  test('should complete conversation via GUI using semantic similarity', async ({ page }) => {
    // Similar to above but with semantic test inputs
    const testInputs = await generateSemanticTestInputs();
    
    for (const testInput of testInputs) {
      await page.fill('[data-testid="chat-input"]', testInput.input);
      await page.click('[data-testid="send-button"]');
      
      await page.waitForSelector('[data-testid="chat-message"]');
      
      const response = await page.textContent('[data-testid="chat-message"]:last-child');
      expect(response).toContain(testInput.expectedResponse);
    }
  });
});
```

#### 4.2.2 Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: false, // Set to true for headless
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};
```

## 5. Manual Testing Instructions

### 5.1 Chart-Agnostic Manual Tests

#### 5.1.1 Conversation Flow Testing
1. **Load any Mermaid chart** into the system
2. **Start conversation** and observe initial question
3. **Use exact keywords** from chart rectangles
4. **Verify navigation** follows chart edges correctly
5. **Test semantic inputs** (synonyms, paraphrases)
6. **Test unclear inputs** and verify error messages
7. **Complete all possible paths** through the chart

#### 5.1.2 Error Handling Testing
1. **Test empty input** - should return descriptive error
2. **Test gibberish input** - should return descriptive error
3. **Test very low confidence** - should return descriptive error
4. **Test model loading failure** - should return descriptive error
5. **Verify no hardcoded assumptions** are made

#### 5.1.3 Performance Testing
1. **Measure response time** for keyword inputs (< 200ms)
2. **Measure response time** for semantic inputs (< 300ms)
3. **Test memory usage** during conversation
4. **Test model loading time** (< 5 seconds)
5. **Test embedding calculation** performance

### 5.2 Chart-Specific Manual Tests

#### 5.2.1 Dynamic Test Generation
```javascript
// Generate manual test cases from any chart
function generateManualTestCases(chartPath) {
  const chartText = fs.readFileSync(chartPath, 'utf8');
  const interpreter = new MermaidInterpreter();
  const structure = interpreter.parseMermaidSyntax(chartText);
  
  const testCases = [];
  
  // Extract all diamond nodes (questions)
  const questionNodes = Array.from(structure.nodes.values())
    .filter(node => node.type === 'question');
  
  questionNodes.forEach(questionNode => {
    // Find all possible categories for this question
    const categories = findCategoriesForQuestion(questionNode.id, structure);
    
    categories.forEach(category => {
      // Find keywords for this category
      const keywords = findKeywordsForCategory(category, structure);
      
      testCases.push({
        question: questionNode.text,
        category: category,
        keywords: keywords,
        testInputs: [
          // Exact keyword test
          keywords[0],
          // Semantic equivalent test
          generateSemanticEquivalent(keywords[0]),
          // Unclear input test
          'I am not sure'
        ]
      });
    });
  });
  
  return testCases;
}
```

## 6. Test Execution Commands

### 6.1 Unit Tests
```bash
# Run all unit tests
npm test

# Run specific test suites
npm test -- --testNamePattern="MermaidInterpreter"
npm test -- --testNamePattern="USE Lite"
npm test -- --testNamePattern="NLPParser"

# Run with coverage
npm test -- --coverage
```

### 6.2 E2E Tests
```bash
# Run headless E2E tests
npm run test:e2e

# Run GUI automation tests
npm run test:gui

# Run specific E2E test
npm run test:e2e -- --testNamePattern="keyword"
```

### 6.3 Performance Tests
```bash
# Run performance benchmarks
npm run test:performance

# Run memory usage tests
npm run test:memory
```

## 7. Test Data Management

### 7.1 Dynamic Test Chart Generation
```javascript
// tests/utils/test-chart-generator.js
function generateTestChart() {
  return `
flowchart TD
    Start{"How are you feeling?"} -->|Good| Good["happy, content, fine, well"]
    Start -->|Bad| Bad["sad, upset, angry, frustrated"]
    Start -->|Unsure| Unsure["confused, uncertain, unclear"]
    Good --> End{"Great! Take care."}
    Bad --> End{"I'm here to help."}
    Unsure --> End{"Let's figure this out."}
  `;
}
```

### 7.2 Test Environment Setup
```bash
# Create test charts directory
mkdir -p test-charts

# Generate test charts
node scripts/generate-test-charts.js

# Verify test charts
npm run test:charts
```

This test plan ensures **complete chart-agnostic testing** that adapts to any Mermaid chart structure while providing comprehensive coverage of the USE Lite integration! 🎯 