import { enUS } from 'date-fns/locale'

// Numbers in prose, spelled out: 8 → "eight", 21 → "twenty-one". Digits from 100 on.
const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function spell(n: number): string {
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '')
  return String(n)
}

/** "Eight years", ready to open a sentence. */
function yearsCount(n: number): string {
  const text = `${spell(n)} ${n === 1 ? 'year' : 'years'}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * English — the primary language and the source of truth for every UI string.
 *
 * Its shape *is* the `Messages` type: every other locale has to provide the
 * same keys with the same signatures, so a missing translation fails the
 * build instead of showing up blank on the site.
 */
const en = {
  /** The site's languages, named in this language (for use inside sentences). */
  languages: {
    en: 'English',
    es: 'Spanish',
  },

  /** date-fns locale and format patterns. */
  dates: {
    locale: enUS,
    long: 'MMMM d, yyyy',
    short: 'MMM d, yyyy',
  },

  /**
   * Category and tag names are stored in English, so English shows them as
   * they are. Other locales map the stored name to its translation; anything
   * left out is shown in English.
   */
  categories: {} as Record<string, string>,
  tags: {} as Record<string, string>,

  site: {
    tagline: 'Python, backends, and things worth writing down.',
  },

  common: {
    backToBlog: 'Back to blog',
    allPosts: 'All posts',
    visitPortfolio: 'Visit my portfolio →',
  },

  nav: {
    blog: 'Blog',
    about: 'About',
    language: 'Language',
    toggleTheme: 'Toggle theme',
    toggleMenu: 'Toggle menu',
  },

  footer: {
    builtWith: 'Built with FastAPI, React and quality coffee ☕',
    portfolio: 'Portfolio',
    about: 'About',
    email: 'Email',
  },

  /** Shown when the page's language isn't the reader's. Written in the reader's language. */
  languageDialog: {
    title: (current: string) => `This page is in ${current}`,
    body: (preferred: string) => `The blog is also available in ${preferred}. Would you like to switch?`,
    switchTo: (preferred: string) => `Switch to ${preferred}`,
    stayIn: (current: string) => `Stay in ${current}`,
  },

  posts: {
    count: (n: number) => (n === 1 ? '1 post' : `${n} posts`),
    readTime: (minutes: number) => `${minutes} min read`,
    updated: (date: string) => `Updated ${date}`,
    onlyIn: (language: string) => `Only available in ${language}`,
    moreTags: (n: number) => `Show ${n} more tag${n === 1 ? '' : 's'}`,
    none: 'No posts yet.',
    noneInCategory: 'No posts in this category yet.',
    noneWithTag: 'No posts with this tag yet.',
  },

  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
  },

  home: {
    badge: 'Personal Blog',
    searchPlaceholder: 'Search posts by title, topic, or keyword…',
    search: 'Search',
    inCategory: (category: string) => ` in ${category}`,
  },

  post: {
    notFound: 'Post not found',
    untranslated: (original: string) =>
      `This post hasn't been translated into English yet, so you're reading the original ${original} version.`,
    signOff:
      'So many stories yet to tell… may your sky stay curious, your compass stubborn, and your horizon a bit wider.',
  },

  category: {
    fallbackTitle: 'Category',
  },

  search: {
    title: 'Search',
    resultsFor: (query: string) => `Results for "${query}"`,
    resultCount: (n: number) => (n === 1 ? '1 result' : `${n} results`),
    noResults: (query: string) => `No posts found for "${query}"`,
    tryAnother: 'Try a different search term.',
  },

  notFound: {
    // The second word gets the gradient.
    titleStart: 'Not',
    titleEnd: 'Found',
    text: "This page doesn't exist. Maybe the post was moved or deleted.",
  },

  about: {
    greeting: "Hey, I'm Joaquín.",
    intro: {
      // Split around the link to Allot. `years` counts from CAREER_START (data/index.ts).
      workBefore: "I'm a senior backend engineer at ",
      workAfter: (years: number) =>
        `, building cybersecurity software that processes and secures ISP traffic at scale. ${yearsCount(years)} of distributed systems, Python, and backend-related projects. Seriously, I've done almost everything.`,
      notAll: "But that's not all!",
      passions:
        "In the mornings I try to brew the perfect coffee, and by night I point a telescope at the sky and wonder what's out there.",
      corner:
        "This is my personal corner of the internet. Not a portfolio, not a CV — just a place to write honestly about engineering, hobbies, and life in Albacete, a mid-sized Spanish city. It's my personal journal, a small peek into my inner world.",
    },
    currently: {
      heading: 'Currently',
      role: 'Senior Python Backend Developer',
      at: ' at ',
      period: 'May 2025 – Present',
      description:
        'Part of the ASM team — a cybersecurity SaaS platform sold to ISPs worldwide. Microservices in Python, Kafka, Redis, MongoDB. Processing millions of security events per second.',
      // Split around the link to Tajamar.
      alsoBefore: 'I also teach advanced Python at ',
      alsoAfter: " and I'm an active FOSS contributor.",
    },
    gallery: {
      heading: 'Outside the terminal',
      captions: {
        me: "That's me!",
        astronomy: 'Astronomy',
        warhammer: 'Warhammer',
        barista: 'Barista coffee',
        tourism: 'Tourism',
        fiveADay: 'Five a Day freelance project',
      },
    },
    features: {
      engineering: {
        subtitle: 'Engineering',
        title: 'The hobby that became my lifestyle',
        text: (years: number) =>
          `${yearsCount(years)} building distributed systems, event-driven architectures, APIs and microservices. I write about what worked, what broke, and why. Mistakes are the path to mastery, and I honestly love my job.`,
        alt: 'Rust code snippet: an async event consumer that retries every failure as a lesson learned',
      },
      hobbies: {
        subtitle: 'Hobbies',
        title: 'A little piece of my life',
        text: 'Impossibly beautiful nights with a telescope. Warhammer and long painting sessions with my Custodes or Votann. Coffee, matcha and latte art. Latin dancing. Muay Thai, running, hiking… almost any sport.',
        alt: 'A picture of me playing the piano',
      },
      life: {
        subtitle: 'Life & Lifestyle',
        title: 'The human behind the code',
        text: 'Based in Albacete, working remotely. Bilingual in Spanish and English. This blog is my honest record — the engineering, the hobbies, and everything in between. A snapshot of me today that will be a beautiful memory tomorrow.',
        alt: 'A picture of me and my significant other',
      },
    },
    project: {
      heading: 'Proud of this project',
      // Split around the project's name.
      before: "I'm building ",
      after:
        " — a journal that listens back. You write, or simply speak, about your days, your habits and the goals you're chasing, and Joy quietly reads between the lines: a language model feels the mood of every entry, voice notes turn into text, and each week your own words come back to you as insights you didn't know you'd written. Beneath that calm surface runs the kind of system I love to build: Flask microservices trading events over RabbitMQ, NLP pipelines, MongoDB at the core with search and analytics stores alongside, a React frontend, secure sign-in, and every piece containerized and ready to scale on Kubernetes. A diary on the outside; a distributed system on the inside.",
    },
    readTheBlog: '← Read the blog',
  },
}

export type Messages = typeof en

export default en
