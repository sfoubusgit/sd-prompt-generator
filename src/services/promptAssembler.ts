import { InterviewNode, RefinementNode } from '../types/interview';
import { sanitizeTemplate } from './templateSanitizer';

// Detects whether an answer is abstract and needs expansion
const ABSTRACT_ANSWERS = [
  "subtle",
  "moderate",
  "pronounced",
  "strong",
  "focused",
  "natural",
  "intense",
  "slight",
  "minimal",
  "extreme",
  "soft",
  "hard"
];

// Breast shape identifiers that should be expanded in breast-related contexts
const BREAST_SHAPE_KEYWORDS = [
  "round", "teardrop", "full", "shallow", "athletic",
  "wide-set", "close-set", "asymmetrical", "augmented", "natural"
];

function expandAbstractAnswer(answer: string, question: string): string {
  const a = answer.toLowerCase().trim();
  const q = question.toLowerCase();

  // Check if question is about breast/bust/chest anatomy
  const isBreastContext = q.includes("breast") ||
    q.includes("bust") ||
    q.includes("chest anatomy") ||
    q.includes("upper torso") ||
    q.includes("torso shape");

  // If it's a known breast-shape identifier in breast context, expand it
  if (isBreastContext && BREAST_SHAPE_KEYWORDS.includes(a)) {
    // Will be handled by the breast-shape block below
  } else if (!ABSTRACT_ANSWERS.includes(a) && !BREAST_SHAPE_KEYWORDS.includes(a)) {
    // Not abstract and not a breast shape keyword, return as-is
    return answer;
  }

  //--------------------------------------------------------------------------
  // BREAST / BUST / UPPER-TORSO SHAPE (Anatomical, non-sexual, artistic)
  //--------------------------------------------------------------------------
  // Check breast context FIRST to ensure priority over other categories
  if (isBreastContext) {
    // Abstract modifiers → context expansions
    if (a === "subtle")
      return "subtle breast definition with gentle anatomical silhouette";
    if (a === "moderate")
      return "moderate breast definition with balanced curvature and natural proportions";
    if (a === "pronounced")
      return "pronounced breast curvature with clearly defined upper-torso silhouette";
    if (a === "soft")
      return "soft breast contours with smooth anatomical transitions";
    if (a === "hard")
      return "firm breast contours with sculpted anatomical form";
    if (a === "minimal")
      return "minimal breast projection with understated chest anatomy";
    if (a === "extreme")
      return "highly emphasized breast curvature with dramatic anatomical silhouette";
    if (a === "strong")
      return "strongly defined breast shape with enhanced anatomical contour";
    if (a === "intense")
      return "intensely emphasized upper-torso anatomy and curvature";

    // BREAST SHAPE IDENTIFIERS (non-abstract answers)
    if (a === "round")
      return "round breast shape with balanced fullness";
    if (a === "teardrop")
      return "teardrop breast shape with lower-fullness profile";
    if (a === "full")
      return "full, evenly distributed breast volume";
    if (a === "shallow")
      return "shallow breast projection with gentle slope";
    if (a === "athletic")
      return "athletic chest anatomy with minimal projection";
    if (a === "wide-set" || a === "wide set" || a === "east-west" || a === "east_west")
      return "wide-set breast placement with visible sternum spacing";
    if (a === "close-set" || a === "close set" || a === "side-set" || a === "side_set")
      return "close-set breast placement with narrow anatomical spacing";
    if (a === "asymmetric" || a === "asymmetrical")
      return "naturally asymmetrical breast proportions";
    if (a === "augmented")
      return "augmented breast shape with structured curvature";
    if (a === "natural")
      return "natural breast shape with organic anatomical silhouette";
    if (a === "bell" || a === "bell shape")
      return "bell-shaped breast profile with wider base and tapered top";
    if (a === "slender")
      return "slender breast profile with elongated anatomical form";
    if (a === "relaxed")
      return "relaxed breast tissue with natural downward contour";
    if (a === "conical")
      return "conical breast shape with pointed anatomical structure";
    
    // If we're in breast context but no match above, return original (shouldn't happen)
    return answer;
  }

  // OTHERWORLDLINESS / SUPERNATURALITY
  if (q.includes("otherworld") || q.includes("supernatural") || q.includes("non-human")) {
    if (a === "subtle")     return "subtle otherworldly presence";
    if (a === "moderate")   return "moderate degree of otherworldly traits";
    if (a === "pronounced") return "strongly pronounced supernatural features";
    if (a === "extreme")    return "extremely vivid otherworldly appearance";
  }

  // INTENSITY / STRENGTH
  if (q.includes("intensity") || q.includes("strength")) {
    return `${a} intensity level`;
  }

  // EMOTION / PERSONALITY
  if (q.includes("mood") || q.includes("emotion") || q.includes("personality")) {
    return `${a} emotional expression`;
  }

  // COLOR / STYLE
  if (q.includes("style") || q.includes("art style")) {
    return `${a} stylistic effect`;
  }

  // CAMERA / PERSPECTIVE
  if (q.includes("camera") || q.includes("perspective") || q.includes("angle")) {
    return `${a} camera perspective adjustment`;
  }

  // LIGHTING
  if (q.includes("light") || q.includes("illumination")) {
    return `${a} lighting effect`;
  }

  // HAIR
  if (q.includes("hair")) {
    return `${a} hair appearance`;
  }

  // BODY / PHYSICAL (but not breast-specific)
  if (q.includes("body") || q.includes("build") || q.includes("shape")) {
    return `${a} physical trait`;
  }

  // GENERAL FALLBACK
  return `${a} visual effect`;
}

// UNIVERSAL NORMALIZATION RULESET
// These rules automatically rewrite vague templates into unambiguous,
// domain-specific descriptions that are safe for Stable Diffusion.

const NORMALIZATION_RULES: Record<string, (t: string) => string> = {
  hair: (t) => {
    // handle specific common vague forms
    if (t.includes("wave")) return "soft loose waves in the hair";
    if (t.includes("curl")) return "defined hair curls";
    if (t.includes("volume")) return "voluminous hairstyle";
    if (t.includes("texture")) return "hair texture detailing";

    // fallback
    return `hairstyle with ${t}`;
  },

  eyes: (t) => {
    if (!t.includes("eye")) return `eye ${t}`;
    return t;
  },

  face: (t) => {
    if (!t.includes("face")) return `facial ${t}`;
    return t;
  },

  environment: (t) => {
    if (t.includes("depth")) return "environment depth layering";
    if (!t.includes("environment")) return `environment ${t}`;
    return t;
  },

  lighting: (t) => {
    if (!t.includes("light")) return `lighting ${t}`;
    return t;
  },

  camera: (t) => {
    if (!t.includes("camera")) return `camera ${t}`;
    return t;
  },

  color: (t) => {
    if (!t.includes("color")) return `color style ${t}`;
    return t;
  },

  materials: (t) => {
    return `${t} material texture`;
  },

  clothing: (t) => {
    if (!t.includes("clothing")) return `clothing ${t}`;
    return t;
  },

  fabric: (t) => {
    if (!t.includes("fabric")) return `fabric ${t}`;
    return t;
  },

  armor: (t) => {
    if (!t.includes("armor")) return `armor ${t}`;
    return t;
  },

  magic: (t) => {
    if (!t.includes("magic")) return `magical ${t}`;
    return t;
  },

  expression: (t) => {
    if (!t.includes("expression")) return `expression ${t}`;
    return t;
  },

  pose: (t) => {
    if (!t.includes("pose")) return `pose ${t}`;
    return t;
  },
};

function normalizeTemplate(template: string, tags: string[] = []): string {
  let t = template.toLowerCase().trim();

  // apply rule for each tag the weight has
  for (const tag of tags) {
    const rule = NORMALIZATION_RULES[tag];
    if (rule) {
      t = rule(t);
    }
  }

  return t;
}

export interface SelectedAnswer {
  id: string; // Unique ID for this selection
  nodeId: string;
  answerId: string;
  label: string;
  questionText?: string; // Question text for context
}

export interface SelectedRefinement {
  id: string; // Unique ID for this selection
  refinementId: string;
  answerId: string;
  label: string;
  questionText?: string; // Question text for context
}

export interface WeightValue {
  id: string; // Unique ID for this weight instance
  attrId: string;
  value: number;
  template: string;
  tags?: string[];
  associatedAnswerId?: string; // ID of the selection this weight belongs to
  answerLabel?: string; // Label of the answer to prefix the template
}

export function assemblePrompt(
  answers: SelectedAnswer[],
  refinements: SelectedRefinement[],
  weights: WeightValue[],
  customElements: Array<{ text: string; enabled: boolean; type: 'prompt' | 'negative' }> = []
): { prompt: string; negativePrompt: string } {
  let parts: string[] = [];

  // Format answers - add context from question when appropriate
  answers.forEach(a => {
    let label = a.label;
    
    // First, check if answer is abstract and needs expansion
    if (a.questionText) {
      label = expandAbstractAnswer(a.label, a.questionText);
    }
    
    // If this is from the character-build node, append "body type"
    if (a.nodeId === 'character-build') {
      label = `${label.toLowerCase()} body type`;
    }
    // If question asks "What are the X like?" or "What is the X like?" or "What is the X?", extract subject and append
    // (but only if not already expanded by expandAbstractAnswer)
    else if (a.questionText && !ABSTRACT_ANSWERS.includes(a.label.toLowerCase().trim())) {
      const question = a.questionText.toLowerCase();
      // Match patterns like:
      // - "What are the lips like?" -> "lips"
      // - "What is the jawline like?" -> "jawline"
      // - "What is the hair texture?" -> "hair texture"
      // - "What is the hair length?" -> "hair length"
      let match = question.match(/what (?:are|is) (?:the )?(.+?) (?:like|like\?)$/);
      if (!match) {
        // Try pattern without "like" - e.g., "What is the hair texture?"
        match = question.match(/what (?:are|is) (?:the )?(.+?)\?$/);
      }
      if (match && match[1]) {
        const subject = match[1].trim();
        label = `${label.toLowerCase()} ${subject}`;
      }
    }
    
    parts.push(label);
  });
  
  refinements.forEach(r => {
    // Expand abstract refinement answers
    let label = r.label;
    if (r.questionText) {
      label = expandAbstractAnswer(r.label, r.questionText);
    }
    parts.push(label);
  });

  // Track seen templates to prevent duplicates
  const seen = new Set<string>();

  weights.forEach(w => {
    // Handle intensity weights specially - format as (answerLabel: intensity)
    if (w.attrId === 'intensity' && w.answerLabel) {
      // Skip intensity for root node answers
      const isRootAnswer = answers.some(a => a.id === w.associatedAnswerId && a.nodeId === 'root');
      if (isRootAnswer) {
        return;
      }
      // Sanitize the answer label for intensity
      const safeLabel = sanitizeTemplate({
        template: w.answerLabel.toLowerCase(),
        tags: w.tags || []
      });
      
      // Check for duplicates
      if (seen.has(safeLabel)) return;
      seen.add(safeLabel);
      
      parts.push(`(${safeLabel}:${w.value.toFixed(2)})`);
      return;
    }
    
    // Skip non-intensity weights that are just 'intensity' template without answerLabel
    if (w.attrId === 'intensity' && !w.answerLabel) {
      return;
    }
    
    let template = w.template;
    
    // ALWAYS prefix template with answer label if available - weights should never appear alone
    // This ensures "augmentations" becomes "augmentations augmentations" (from answer) or similar contextualization
    if (w.answerLabel) {
      // Check if template already contains the answer label to avoid duplication
      const answerLower = w.answerLabel.toLowerCase();
      const templateLower = template.toLowerCase();
      
      // If template doesn't already contain the answer, prefix it
      if (!templateLower.includes(answerLower)) {
        template = `${answerLower} ${template}`;
      } else {
        // Template already contains answer, use as-is but ensure proper formatting
        template = template;
      }
    } else {
      // If no answer label but template is a standalone word like "augmentations",
      // we should still try to find context or use a fallback
      // For now, we'll let it through but this should ideally never happen
      // (weights should always have answer context)
    }
    
    // First normalize, then sanitize
    const normalizedTemplate = normalizeTemplate(template, w.tags || []);
    const safeTemplate = sanitizeTemplate({
      template: normalizedTemplate,
      tags: w.tags || []
    });
    
    // Skip duplicates
    if (seen.has(safeTemplate)) return;
    seen.add(safeTemplate);
    
    parts.push(`(${safeTemplate}:${w.value.toFixed(2)})`);
  });

  // Add custom elements to main prompt (only enabled ones with type 'prompt')
  const customPromptElements: string[] = [];
  const customNegativeElements: string[] = [];
  
  customElements.forEach(element => {
    if (element.enabled) {
      if (element.type === 'prompt') {
        customPromptElements.push(element.text);
      } else {
        customNegativeElements.push(element.text);
      }
    }
  });

  // Add custom prompt elements
  customPromptElements.forEach(element => {
    parts.push(element);
  });

  const prompt = parts.join(', ');
  
  // Build negative prompt with custom elements
  const negativeParts = ['deformed', 'distorted', 'extra limbs', 'low detail', 'low quality', 'bad anatomy'];
  negativeParts.push(...customNegativeElements);
  const negativePrompt = negativeParts.join(', ');

  return { prompt, negativePrompt };
}



