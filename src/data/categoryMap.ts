// Category Navigation Map
// Maps category IDs to their entry node IDs for direct navigation
// Supports hierarchical structure with subcategories

export interface CategoryItem {
  label: string;
  nodeId?: string; // If provided, clicking navigates to this node
  subcategories?: CategoryItem[]; // Nested subcategories
}

export interface CategoryStructure {
  [categoryId: string]: CategoryItem[];
}

export const CATEGORY_MAP: CategoryStructure = {
  character: [
    { label: "Identity", nodeId: "character-identity-root" },
    { label: "Expression", nodeId: "character-expression-root" },
    { label: "Pose", nodeId: "character-pose-root" },
    { label: "Archetype", nodeId: "character-archetype-root" }
  ],

  physical: [
    {
      label: "Body Attributes",
      nodeId: "character-body-root",
      subcategories: [
        { label: "Height", nodeId: "character-height" },
        { label: "Build", nodeId: "character-build" },
        { label: "Posture", nodeId: "character-posture" }
      ]
    },
    {
      label: "Clothing",
      nodeId: "character-clothing-root",
      subcategories: [
        { label: "Casual", nodeId: "clothing-casual" },
        { label: "Formal", nodeId: "clothing-formal" },
        { label: "Fantasy", nodeId: "clothing-fantasy" },
        { label: "Sci-fi", nodeId: "clothing-scifi" },
        { label: "Armor", nodeId: "clothing-armor" },
        { label: "Robe", nodeId: "clothing-robe" },
        { label: "Streetwear", nodeId: "clothing-streetwear" }
      ]
    },
    {
      label: "Accessories",
      nodeId: "character-accessories-root",
      subcategories: [
        { label: "Jewelry", nodeId: "accessories-jewelry" },
        { label: "Headwear", nodeId: "accessories-headwear" },
        { label: "Glasses", nodeId: "accessories-glasses" },
        { label: "Mask", nodeId: "accessories-mask" },
        { label: "Tech Gadgets", nodeId: "accessories-tech" },
        { label: "Weapon", nodeId: "accessories-weapon" }
      ]
    },
    {
      label: "NSFW Attributes",
      nodeId: "character-nsfw-root",
      subcategories: [
        { label: "Nudity", nodeId: "nsfw-nude" },
        { label: "Breasts", nodeId: "nsfw-breasts" },
        { label: "Vagina", nodeId: "nsfw-vagina" },
        { label: "Penis", nodeId: "nsfw-penis" },
        { label: "Buttocks", nodeId: "nsfw-buttocks" }
      ]
    }
  ],

  hair: [
    {
      label: "Hair",
      nodeId: "character-hair-root",
      subcategories: [
        { label: "Length", nodeId: "hair-length" },
        { label: "Texture", nodeId: "hair-texture" },
        { label: "Style", nodeId: "hair-style" },
        { label: "Color", nodeId: "hair-color" }
      ]
    },
    {
      label: "Body Hair",
      nodeId: "body-hair-root",
      subcategories: [
        { label: "Amount", nodeId: "body-hair-amount" },
        { label: "Texture", nodeId: "body-hair-texture" },
        { label: "Color", nodeId: "body-hair-color" },
        { label: "Location", nodeId: "body-hair-location" }
      ]
    }
  ],

  face: [
    {
      label: "Face",
      nodeId: "character-face-root",
      subcategories: [
        { label: "Face Shape", nodeId: "face-shape" },
        { label: "Eyes", nodeId: "face-eyes" },
        { label: "Jawline", nodeId: "face-jawline" },
        { label: "Lips", nodeId: "face-lips" },
        { label: "Eyebrows", nodeId: "face-eyebrows" }
      ]
    },
    {
      label: "Face Art",
      nodeId: "face-art-root",
      subcategories: [
        { label: "Makeup", nodeId: "face-art-makeup" },
        { label: "Face Paint & Body Paint", nodeId: "face-art-face-paint" },
        { label: "Traditional & Cultural", nodeId: "face-art-traditional" },
        { label: "Permanent / Semi-Permanent", nodeId: "face-art-permanent" },
        { label: "Fantasy & Sci-Fi Markings", nodeId: "face-art-fantasy" },
        { label: "Glitter & Adornments", nodeId: "face-art-glitter" }
      ]
    }
  ],

  environment: [
    {
      label: "Environment",
      nodeId: "env-root",
      subcategories: [
        { label: "Nature", nodeId: "nature-biomes-root" },
        { label: "City / Settlement", nodeId: "cities-settlements-root" },
        { label: "Interior", nodeId: "interiors-root" },
        { label: "Fantasy Realm", nodeId: "fantasy-realms-root" },
        { label: "Sci-fi World", nodeId: "scifi-worlds-root" },
        { label: "Ruins / Ancient Places", nodeId: "ruins-structures-root" }
      ]
    }
  ],

  style: [
    {
      label: "Art Style",
      nodeId: "style-artstyle-root",
      subcategories: [
        { label: "Anime", nodeId: "anime-styles-root" },
        { label: "Semi-realistic", nodeId: "realism-styles-root" },
        { label: "Realistic", nodeId: "realism-styles-root" },
        { label: "Painterly", nodeId: "painting-styles-root" },
        { label: "3D Render", nodeId: "3d-styles-root" },
        { label: "Cartoon", nodeId: "cinematic-styles-root" },
        { label: "Comic Book", nodeId: "cinematic-styles-root" },
        { label: "Pixel Art", nodeId: "color-palettes-root" }
      ]
    },
    {
      label: "Lighting",
      nodeId: "lighting-root"
    }
  ],

  camera: [
    {
      label: "Composition",
      subcategories: [
        { label: "Angle", nodeId: "camera-angle-root" },
        { label: "Framing", nodeId: "camera-framing-root" },
        { label: "Perspective", nodeId: "perspective-root" }
      ]
    },
    {
      label: "Technical",
      subcategories: [
        { label: "Lens", nodeId: "camera-lens-root" },
        { label: "Depth of Field", nodeId: "camera-dof-root" },
        { label: "Motion", nodeId: "camera-motion-root" },
        { label: "Render Quality", nodeId: "camera-render-quality-root" }
      ]
    }
  ],

  effects: [
    {
      label: "Effects",
      nodeId: "effects-root",
      subcategories: [
        {
          label: "Lighting Effects",
          nodeId: "effects-lighting-root",
          subcategories: [
            { label: "Rim Lighting", nodeId: "effects-rim-lighting" },
            { label: "Volumetric God Rays", nodeId: "effects-volumetric-god-rays" },
            { label: "Backlighting", nodeId: "effects-backlighting" },
            { label: "Neon & Cyberpunk", nodeId: "effects-neon-cyberpunk" },
            { label: "Lens & Practical", nodeId: "effects-lens-practical" }
          ]
        },
        {
          label: "Atmosphere & Particles",
          nodeId: "effects-atmosphere-root",
          subcategories: [
            { label: "Fog & Mist", nodeId: "effects-fog-mist" },
            { label: "Precipitation", nodeId: "effects-precipitation" },
            { label: "Floating Particles", nodeId: "effects-floating-particles" },
            { label: "Smoke & Vapor", nodeId: "effects-smoke-vapor" }
          ]
        },
        {
          label: "Color Grading & Mood",
          nodeId: "effects-color-grading-root",
          subcategories: [
            { label: "Cinematic Grading", nodeId: "effects-cinematic-grading" },
            { label: "Fantasy Grading", nodeId: "effects-fantasy-grading" },
            { label: "Temperature", nodeId: "effects-temperature" }
          ]
        },
        {
          label: "Post-Processing & Film Looks",
          nodeId: "effects-post-processing-root",
          subcategories: [
            { label: "Film Emulation", nodeId: "effects-film-emulation" },
            { label: "Digital Artifacts", nodeId: "effects-digital-artifacts" },
            { label: "Depth & Focus", nodeId: "effects-depth-focus" }
          ]
        },
        {
          label: "Magical & Energetic Effects",
          nodeId: "effects-magical-root",
          subcategories: [
            { label: "Aura & Energy", nodeId: "effects-aura-energy" },
            { label: "Sparks & Runes", nodeId: "effects-sparks-runes" },
            { label: "Distortion & Time", nodeId: "effects-distortion-time" }
          ]
        },
        {
          label: "Surface & Material FX",
          nodeId: "effects-surface-root",
          subcategories: [
            { label: "Wet & Glossy", nodeId: "effects-wet-glossy" },
            { label: "Metallic & Reflective", nodeId: "effects-metallic-reflective" },
            { label: "Organic & Decay", nodeId: "effects-organic-decay" }
          ]
        },
        {
          label: "Camera & Resolution Boosters",
          nodeId: "effects-camera-boosters-root",
          subcategories: [
            { label: "Lens Simulation", nodeId: "effects-lens-simulation" },
            { label: "Quality Enhancers", nodeId: "effects-quality-enhancers" }
          ]
        }
      ]
    }
  ]
};

// Legacy flat map for backward compatibility (if needed elsewhere)
export const CATEGORY_MAP_FLAT: Record<string, string[]> = {
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





