/**
 * Service for managing AI chat background images
 */

export interface ChatBackground {
  id: string;
  name: string;
  url: string;
  category: "gradient" | "nature" | "abstract" | "minimal";
  description: string;
}

export const CHAT_BACKGROUNDS: ChatBackground[] = [
  // Gradient backgrounds
  {
    id: "gradient-blue-purple",
    name: "Blue Purple Gradient",
    url: "/images/chat-backgrounds/gradient-blue-purple.jpg",
    category: "gradient",
    description: "Calming blue to purple gradient"
  },
  {
    id: "gradient-sunset",
    name: "Sunset Gradient",
    url: "/images/chat-backgrounds/gradient-sunset.jpg",
    category: "gradient",
    description: "Warm sunset colors"
  },
  {
    id: "gradient-ocean",
    name: "Ocean Gradient",
    url: "/images/chat-backgrounds/gradient-ocean.jpg",
    category: "gradient",
    description: "Deep ocean blue gradient"
  },
  {
    id: "gradient-forest",
    name: "Forest Gradient",
    url: "/images/chat-backgrounds/gradient-forest.jpg",
    category: "gradient",
    description: "Green forest gradient"
  },

  // Nature backgrounds
  {
    id: "nature-mountains",
    name: "Mountain View",
    url: "/images/chat-backgrounds/nature-mountains.jpg",
    category: "nature",
    description: "Peaceful mountain landscape"
  },
  {
    id: "nature-forest",
    name: "Forest Path",
    url: "/images/chat-backgrounds/nature-forest.jpg",
    category: "nature",
    description: "Serene forest path"
  },
  {
    id: "nature-ocean",
    name: "Ocean Waves",
    url: "/images/chat-backgrounds/nature-ocean.jpg",
    category: "nature",
    description: "Calming ocean waves"
  },
  {
    id: "nature-clouds",
    name: "Cloud Sky",
    url: "/images/chat-backgrounds/nature-clouds.jpg",
    category: "nature",
    description: "Peaceful cloudy sky"
  },

  // Abstract backgrounds
  {
    id: "abstract-geometric",
    name: "Geometric Patterns",
    url: "/images/chat-backgrounds/abstract-geometric.jpg",
    category: "abstract",
    description: "Modern geometric design"
  },
  {
    id: "abstract-waves",
    name: "Abstract Waves",
    url: "/images/chat-backgrounds/abstract-waves.jpg",
    category: "abstract",
    description: "Flowing abstract waves"
  },
  {
    id: "abstract-particles",
    name: "Particle Field",
    url: "/images/chat-backgrounds/abstract-particles.jpg",
    category: "abstract",
    description: "Dynamic particle field"
  },

  // Minimal backgrounds
  {
    id: "minimal-white",
    name: "Clean White",
    url: "/images/chat-backgrounds/minimal-white.jpg",
    category: "minimal",
    description: "Simple white background"
  },
  {
    id: "minimal-gray",
    name: "Soft Gray",
    url: "/images/chat-backgrounds/minimal-gray.jpg",
    category: "minimal",
    description: "Subtle gray texture"
  },
  {
    id: "minimal-beige",
    name: "Warm Beige",
    url: "/images/chat-backgrounds/minimal-beige.jpg",
    category: "minimal",
    description: "Warm beige tone"
  }
];

/**
 * Get all available chat backgrounds
 */
export function getChatBackgrounds(): ChatBackground[] {
  return CHAT_BACKGROUNDS;
}

/**
 * Get backgrounds by category
 */
export function getChatBackgroundsByCategory(category: ChatBackground["category"]): ChatBackground[] {
  return CHAT_BACKGROUNDS.filter(bg => bg.category === category);
}

/**
 * Get a specific background by ID
 */
export function getChatBackgroundById(id: string): ChatBackground | undefined {
  return CHAT_BACKGROUNDS.find(bg => bg.id === id);
}

/**
 * Get the default background
 */
export function getDefaultChatBackground(): ChatBackground {
  return CHAT_BACKGROUNDS[0]; // Blue Purple Gradient
}

/**
 * Generate CSS background style for a background
 */
export function getChatBackgroundStyle(backgroundId: string): React.CSSProperties {
  const background = getChatBackgroundById(backgroundId);
  
  if (!background) {
    return {};
  }

  return {
    backgroundImage: `url(${background.url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
}

/**
 * Fallback backgrounds using CSS gradients if images aren't available
 */
export const FALLBACK_GRADIENTS: Record<string, string> = {
  "gradient-blue-purple": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "gradient-sunset": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "gradient-ocean": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "gradient-forest": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "nature-mountains": "linear-gradient(135deg, #89c4f4 0%, #718096 100%)",
  "nature-forest": "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)",
  "nature-ocean": "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  "nature-clouds": "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
  "abstract-geometric": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "abstract-waves": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "abstract-particles": "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  "minimal-white": "linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)",
  "minimal-gray": "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
  "minimal-beige": "linear-gradient(135deg, #fefcf0 0%, #f6f3e7 100%)"
};

/**
 * Get fallback gradient for a background
 */
export function getFallbackGradient(backgroundId: string): string {
  return FALLBACK_GRADIENTS[backgroundId] || FALLBACK_GRADIENTS["gradient-blue-purple"];
}
