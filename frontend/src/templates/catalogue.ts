import type { PostCategory } from '../data'

/**
 * Template metadata, grouped by topic as shown in the composer's menu.
 * The Markdown body for an entry lives in `bodies/<id>.md`; entries without
 * one are listed but disabled. Tag names must match the spelling in
 * `data/tags.ts` to be highlighted.
 */
export interface TemplateDefinition {
  id: string
  label: string
  category: PostCategory
  tags: readonly string[]
}

export interface TemplateGroupDefinition {
  label: string
  templates: readonly TemplateDefinition[]
}

export const TEMPLATE_CATALOGUE: readonly TemplateGroupDefinition[] = [
  {
    label: 'Software & Engineering',
    templates: [
      { id: 'programming', label: 'Programming', category: 'Engineering', tags: ['python', 'rust', 'go', 'csharp', 'elixir', 'bash', 'sql', 'nosql', 'coding'] },
      { id: 'software-development', label: 'Software development', category: 'Engineering', tags: ['frontend', 'backend', 'fullstack', 'api-design', 'graphql', 'rest'] },
      { id: 'architecture', label: 'Architecture & systems', category: 'Engineering', tags: ['architecture', 'software design', 'distributed systems', 'streaming', 'kafka'] },
      { id: 'cloud', label: 'Cloud & infrastructure', category: 'Engineering', tags: ['cloud', 'aws', 'azure', 'gcp', 'infrastructure', 'networking'] },
      { id: 'devops', label: 'DevOps & automation', category: 'Engineering', tags: ['devops', 'terraform', 'ansible', 'docker', 'kubernetes', 'ci/cd'] },
      { id: 'quality', label: 'Quality & reliability', category: 'Engineering', tags: ['testing', 'observability', 'monitoring', 'tracing', 'logging'] },
      { id: 'performance-security', label: 'Performance & security', category: 'Engineering', tags: ['performance', 'profiling', 'security'] },
      { id: 'dev-tools', label: 'Developer tools & open source', category: 'Engineering', tags: ['github', 'tooling', 'IDE', 'open-source'] },
      { id: 'ai', label: 'Artificial intelligence', category: 'Engineering', tags: ['ai'] },
      { id: 'engineering-productivity', label: 'Engineering productivity', category: 'Engineering', tags: ['productivity'] },
    ],
  },
  {
    label: 'Outdoors & Adventure',
    templates: [
      { id: 'hiking', label: 'Hiking & trails', category: 'Hobbies', tags: ['hiking', 'trail'] },
      { id: 'cycling', label: 'Cycling', category: 'Hobbies', tags: ['cycling'] },
      { id: 'camping', label: 'Camping & outdoor gear', category: 'Hobbies', tags: ['camping', 'gear'] },
      { id: 'travel', label: 'Travel', category: 'Hobbies', tags: ['tourism'] },
    ],
  },
  {
    label: 'Making, Photography & Technology',
    templates: [
      { id: 'diy', label: 'DIY & maker projects', category: 'Hobbies', tags: ['diy engineering'] },
      { id: 'electronics', label: 'Electronics & microcontrollers', category: 'Hobbies', tags: ['arduino'] },
      { id: '3d-printing', label: '3D printing', category: 'Hobbies', tags: ['3d printing'] },
      { id: 'drones', label: 'Drones', category: 'Hobbies', tags: ['drones'] },
      { id: 'photography', label: 'Photography & editing', category: 'Hobbies', tags: ['photography', 'photo editing'] },
    ],
  },
  {
    label: 'Astronomy & Space',
    templates: [
      { id: 'astronomy', label: 'Astronomy', category: 'Hobbies', tags: ['astronomy', 'astrophotography', 'astro-math'] },
    ],
  },
  {
    label: 'Arts & Performance',
    templates: [
      { id: 'music', label: 'Music', category: 'Hobbies', tags: ['piano'] },
      { id: 'dancing', label: 'Dancing', category: 'Hobbies', tags: ['salsa', 'bachata'] },
      { id: 'magic', label: 'Magic & cardistry', category: 'Hobbies', tags: ['illusionism', 'close up magic', 'cardistry'] },
      { id: 'miniature-painting', label: 'Miniature painting', category: 'Hobbies', tags: ['miniature painting'] },
    ],
  },
  {
    label: 'Games',
    templates: [
      { id: 'gaming', label: 'Gaming', category: 'Hobbies', tags: ['warhammer', 'miniature gaming', 'boardgames', 'videogames'] },
    ],
  },
  {
    label: 'Food & Drink',
    templates: [
      { id: 'cooking', label: 'Food & cooking', category: 'Hobbies', tags: ['cooking', 'recipes'] },
      { id: 'coffee-tea', label: 'Coffee & tea', category: 'Hobbies', tags: ['coffee', 'matcha'] },
    ],
  },
  {
    label: 'Fitness',
    templates: [
      { id: 'fitness', label: 'General fitness', category: 'Personal Life', tags: ['fitness'] },
      { id: 'strength', label: 'Strength training & bodybuilding', category: 'Personal Life', tags: ['strength training', 'bodybuilding'] },
      { id: 'nutrition', label: 'Nutrition', category: 'Personal Life', tags: ['nutrition'] },
    ],
  },
  {
    label: 'Sports & Physical Activities',
    templates: [
      { id: 'martial-arts', label: 'Martial arts', category: 'Hobbies', tags: ['martial arts'] },
      { id: 'running', label: 'Running & trail running', category: 'Hobbies', tags: ['running', 'trail'] },
    ],
  },
  {
    label: 'Health & Self-care',
    templates: [
      { id: 'sleep', label: 'Sleep & recovery', category: 'Personal Life', tags: ['sleep'] },
      { id: 'self-care', label: 'Self-care & wellbeing', category: 'Personal Life', tags: ['self care', 'relax', 'stress management'] },
      { id: 'meditation', label: 'Meditation & mindfulness', category: 'Personal Life', tags: ['meditation', 'presence'] },
    ],
  },
  {
    label: 'Personal Development',
    templates: [
      { id: 'habits', label: 'Habits & productivity', category: 'Personal Life', tags: ['habits', 'productivity'] },
      { id: 'goals', label: 'Goals & reflection', category: 'Personal Life', tags: ['goals', 'reflection', 'journaling', 'gratefulness'] },
      { id: 'learning', label: 'Learning & languages', category: 'Personal Life', tags: ['learning', 'language learning'] },
      { id: 'reading', label: 'Reading', category: 'Personal Life', tags: ['books'] },
    ],
  },
  {
    label: 'Career & Professional Growth',
    templates: [
      { id: 'career', label: 'Career, leadership & mentorship', category: 'Engineering', tags: ['career', 'leadership', 'mentorship'] },
    ],
  },
  {
    label: 'Lifestyle & Relationships',
    templates: [
      { id: 'fashion', label: 'Fashion & personal style', category: 'Personal Life', tags: ['fashion'] },
      { id: 'social-skills', label: 'Social skills & communication', category: 'Personal Life', tags: ['social skills', 'communication'] },
      { id: 'relationships', label: 'Relationships & social life', category: 'Personal Life', tags: ['love', 'friendships', 'social life'] },
    ],
  },
  {
    label: 'Finance & Economics',
    templates: [
      { id: 'personal-finance', label: 'Personal finance & investing', category: 'Personal Life', tags: ['personal finance', 'investing'] },
      { id: 'economics', label: 'Economics', category: 'Personal Life', tags: ['economics'] },
    ],
  },
]
