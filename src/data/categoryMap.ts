// Category Navigation Map
// Maps category IDs to their entry node IDs for direct navigation

export const CATEGORY_MAP: Record<string, string[]> = {
  character: [
    "character-identity-root",
    "character-ethnicity-root",
    "character-body-root",
    "character-face-root",
    "character-hair-root",
    "character-expression-root",
    "character-pose-root",
    "character-clothing-root",
    "character-accessories-root",
    "character-archetype-root",
    "character-nsfw-root"
  ],

  physical: [
    "character-body-root",
    "character-ethnicity-root"
  ],

  hair: [
    "character-hair-root"
  ],

  face: [
    "character-face-root"
  ],

  environment: [
    "env-root"
  ],

  style: [
    "style-artstyle-root"
  ],

  camera: [
    "camera-lens-root",
    "camera-angle-root",
    "camera-framing-root",
    "camera-dof-root",
    "camera-motion-root",
    "camera-render-quality-root",
    "perspective-root"
  ],

  effects: [
    "effects-magic-root"
  ]
};



