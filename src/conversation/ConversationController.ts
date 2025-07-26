// Conversation Controller for CALMe Therapeutic Flow
// Implements dynamic conversation flow based on conversation map specification

import { therapeuticConversationMap } from './conversationMap';
import type { ConversationDecisionLogic } from './conversationMap';

// Import types from parser module instead
type ClassificationResult = {
  type: 'classification';
  category: string;
  confidence: number;
  reasoning?: string;
};

type ExtractionResult = {
  type: 'extraction';
  extractedValue: string;
  confidence: number;
  informationType: string;
  extractionMethod?: string;
};

export interface ConversationNode {
  id: string;
  type: 'question' | 'activity' | 'decision' | 'end';
  content?: string;
  next?: string | ConversationDecisionLogic;
  activity?: string;
  parser?: string;
}

export interface ConversationDecision {
  condition: (result: ClassificationResult | ExtractionResult) => boolean;
  nextNode: string;
}

export interface ConversationMap {
  startNode: string;
  nodes: Map<string, ConversationNode>;
}

export interface ActivityTrigger {
  activityName: string;
  returnNode: string;
}

// Enhanced interface for the conversation controller
export interface ConversationControllerInterface {
  // Initialize with a conversation map
  initialize(map?: ConversationMap): void;
  
  // Process parser output and determine next step
  processParserOutput(result: ClassificationResult | ExtractionResult): { nextNode: ConversationNode; activityTrigger?: ActivityTrigger };
  
  // Get current conversation node
  getCurrentNode(): ConversationNode;
  
  // Move to next node
  moveToNode(nodeId: string): ConversationNode;
  
  // Check if conversation is complete
  isComplete(): boolean;
  
  // Reset conversation to start
  reset(): void;
  
  // Get parser type for current node
  getCurrentParserType(): string | null;
}

// Complete implementation
export class ConversationController implements ConversationControllerInterface {
  private conversationMap: ConversationMap;
  private currentNodeId: string;

  constructor() {
    this.conversationMap = therapeuticConversationMap;
    this.currentNodeId = therapeuticConversationMap.startNode;
  }

  initialize(map?: ConversationMap): void {
    this.conversationMap = map || therapeuticConversationMap;
    this.currentNodeId = this.conversationMap.startNode;
  }

  processParserOutput(result: ClassificationResult | ExtractionResult): { nextNode: ConversationNode; activityTrigger?: ActivityTrigger } {
    const currentNode = this.getCurrentNode();
    
    if (!currentNode.next) {
      throw new Error(`Node ${this.currentNodeId} has no next steps defined`);
    }

    let nextNodeId: string;
    
    // Handle simple string next (direct transition)
    if (typeof currentNode.next === 'string') {
      nextNodeId = currentNode.next;
    } else {
      // Handle conditional logic
      const decisionLogic = currentNode.next as ConversationDecisionLogic;
      nextNodeId = this.evaluateConditions(decisionLogic, result);
    }

    // Move to next node
    const nextNode = this.moveToNode(nextNodeId);
    
    // Check if this triggers an activity
    let activityTrigger: ActivityTrigger | undefined;
    if (nextNode.type === 'activity' && nextNode.activity) {
      activityTrigger = {
        activityName: nextNode.activity,
        returnNode: nextNode.next as string // Activities should have simple string next
      };
    }

    return { nextNode, activityTrigger };
  }

  private evaluateConditions(decisionLogic: ConversationDecisionLogic, result: ClassificationResult | ExtractionResult): string {
    // Evaluate each condition in order
    for (const condition of decisionLogic.conditions) {
      if (condition.if) {
        // Create a safe evaluation context
        const evaluationContext = {
          category: result.type === 'classification' ? result.category : undefined,
          extractedValue: result.type === 'extraction' ? result.extractedValue : undefined,
          confidence: result.confidence
        };
        
        try {
          // Simple condition evaluation (can be enhanced with a proper expression parser)
          if (this.evaluateCondition(condition.if, evaluationContext)) {
            return condition.goto;
          }
        } catch (error) {
          console.warn(`Error evaluating condition: ${condition.if}`, error);
          continue;
        }
      } else if (condition.default) {
        return condition.goto; // Use goto for default conditions too
      }
    }
    
    // Fallback to first condition's goto if no default found
    return decisionLogic.conditions[0]?.goto || 'ongoing_support';
  }

  private evaluateCondition(conditionStr: string, context: any): boolean {
    // Simple condition evaluation - replace with a proper expression parser for production
    const { category, extractedValue, confidence } = context;
    
    // Handle common condition patterns
    if (conditionStr.includes('category ===')) {
      const match = conditionStr.match(/category === ["']([^"']+)["']/);
      if (match && category) {
        return category === match[1];
      }
    }
    
    if (conditionStr.includes('||')) {
      const conditions = conditionStr.split('||').map(c => c.trim());
      return conditions.some(cond => this.evaluateCondition(cond, context));
    }
    
    if (conditionStr.includes('extractedValue') && extractedValue) {
      if (conditionStr.includes('.toLowerCase().includes(')) {
        const match = conditionStr.match(/extractedValue\.toLowerCase\(\)\.includes\(["']([^"']+)["']\)/);
        if (match) {
          return extractedValue.toLowerCase().includes(match[1]);
        }
      }
    }
    
    if (conditionStr.includes('confidence') && confidence !== undefined) {
      const match = conditionStr.match(/confidence ([><]=?) ([0-9.]+)/);
      if (match) {
        const operator = match[1];
        const threshold = parseFloat(match[2]);
        switch (operator) {
          case '>': return confidence > threshold;
          case '>=': return confidence >= threshold;
          case '<': return confidence < threshold;
          case '<=': return confidence <= threshold;
          case '==': return confidence === threshold;
        }
      }
    }
    
    return false;
  }

  getCurrentNode(): ConversationNode {
    const node = this.conversationMap.nodes.get(this.currentNodeId);
    if (!node) {
      throw new Error(`Node ${this.currentNodeId} not found`);
    }
    return node;
  }

  moveToNode(nodeId: string): ConversationNode {
    const node = this.conversationMap.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    this.currentNodeId = nodeId;
    return node;
  }

  isComplete(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode.type === 'end';
  }

  reset(): void {
    this.currentNodeId = this.conversationMap.startNode;
  }

  getCurrentParserType(): string | null {
    const currentNode = this.getCurrentNode();
    return currentNode.parser || null;
  }
}