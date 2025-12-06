// templateSanitizer.ts
// Enforces Stable Diffusion–valid template rules and rewrites invalid tokens.

export interface TemplateContext {
  template: string;
  tags: string[];
}

const ABSTRACT_WORDS = new Set([
  "pronounced", "moderate", "subtle", "focused", "otherworldliness",
  "intensity", "emphasis", "height", "very tall", "slim", "strong",
  "playful", "seriousness", "cursed"
]);

// SD-safe conversions for abstract words when paired with categories:
const CATEGORY_REWRITE: Record<string, (t: string) => string> = {
  hair: (t) => {
    if (t.includes("volume")) return "hair volume";
    if (t.includes("color")) return "hair color intensity";
    return `hair ${t}`;
  },

  face: (t) => `facial ${t}`,
  eyes: (t) => `eye ${t}`,
  emotion: (t) => `emotional ${t}`,
  body: (t) => {
    if (t.includes("height")) return "tall body proportions";
    if (t.includes("slim")) return "slim body shape";
    if (t.includes("strong")) return "strong physique";
    return `body trait ${t}`;
  },

  camera: (t) => `camera perspective ${t}`,
  perspective: (t) => `perspective ${t}`,
  lighting: (t) => `lighting ${t}`,
  color: (t) => `color ${t}`
};

// Words that must never appear alone as weighted tokens:
const FORBIDDEN_TEMPLATES = [
  "", " ", "height", "very tall", "slim", "moderate", "subtle",
  "pronounced", "focused", "strong", "cursed"
];

// Fallback context-aware replacements:
function fallbackRewrite(template: string, tags: string[]): string {
  const readable = template.trim().toLowerCase();
  if (tags.includes("body")) return `body trait ${readable}`;
  if (tags.includes("emotion")) return `emotional ${readable}`;
  if (tags.includes("hair")) return `hair ${readable}`;
  if (tags.includes("camera")) return `camera ${readable}`;
  if (tags.includes("perspective")) return `perspective ${readable}`;
  return `visual ${readable}`;
}

// Cleans redundant words like "emphasis", "intensity", "trait"
function stripAbstractWords(template: string): string {
  return template
    .split(" ")
    .filter(word => !ABSTRACT_WORDS.has(word))
    .join(" ")
    .trim();
}

export function sanitizeTemplate({ template, tags }: TemplateContext): string {
  let t = template.toLowerCase().trim();

  // 1. Block empty or forbidden templates
  if (FORBIDDEN_TEMPLATES.includes(t)) {
    return fallbackRewrite(t, tags);
  }

  // 2. Remove abstract filler words
  t = stripAbstractWords(t);

  // 3. Apply category-specific rewrites
  for (const tag of tags) {
    const rule = CATEGORY_REWRITE[tag];
    if (rule) {
      t = rule(t);
    }
  }

  // 4. Last-chance fallback to avoid empty tokens
  if (!t || t.trim().length === 0) {
    return fallbackRewrite(template, tags);
  }

  return t;
}





