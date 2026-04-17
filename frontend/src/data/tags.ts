import type { PostCategory } from './index'

/**
 * Canonical tag catalogue, scoped by category. Picked from a click UI on the
 * post composer — no free-text entry, so the tag space stays bounded.
 */
const RAW_TAGS_BY_CATEGORY: Record<PostCategory, readonly string[]> = {
  Engineering: [
    'python', 'rust', 'go', 'frontend', 'backend', 'devops', 'infrastructure',
    'csharp', 'elixir', 'bash', 'sql', 'nosql', 'fullstack', 'api-design',
    'graphql', 'rest', 'distributed systems', 'streaming', 'kafka', 'cloud',
    'aws', 'azure', 'gcp', 'terraform', 'ansible', 'docker', 'kubernetes',
    'networking', 'ci/cd', 'github', 'testing', 'observability', 'monitoring',
    'tracing', 'logging', 'performance', 'profiling', 'security', 'architecture',
    'software design', 'ai', 'leadership', 'career', 'mentorship', 'open-source',
    'tooling', 'IDE', 'productivity',
  ],
  Hobbies: [
    'coding', 'hiking', 'cycling', 'running', 'trail', 'gear', 'camping',
    'martial arts', 'piano', 'salsa', 'bachata', 'warhammer', 'miniature painting',
    'boardgames', 'videogames', 'diy engineering', 'arduino', '3d printing',
    'astronomy', 'photography', 'astrophotography', 'drones', 'photo editing',
    'illusionism', 'cardistry', 'close up magic', 'tourism', 'language learning',
    'cooking', 'recipes', 'coffee', 'matcha',
  ],
  'Personal Life': [
    'fitness', 'strength training', 'bodybuilding', 'nutrition', 'self care',
    'sleep', 'fashion', 'meditation', 'stress management', 'journaling', 'relax',
    'presence', 'social skills', 'personal finance', 'investing', 'economics',
    'learning', 'habits', 'productivity', 'reflection', 'goals', 'love',
    'friendships', 'social life', 'communication', 'gratefulness', 'books',
  ],
} as const

/** Category → alphabetically sorted tag list. */
export const TAGS_BY_CATEGORY: Record<PostCategory, string[]> = {
  Engineering: [...RAW_TAGS_BY_CATEGORY.Engineering].sort((a, b) => a.localeCompare(b)),
  Hobbies: [...RAW_TAGS_BY_CATEGORY.Hobbies].sort((a, b) => a.localeCompare(b)),
  'Personal Life': [...RAW_TAGS_BY_CATEGORY['Personal Life']].sort((a, b) => a.localeCompare(b)),
}
