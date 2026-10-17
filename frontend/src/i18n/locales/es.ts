import { es as dateLocale } from 'date-fns/locale'
import type { Messages } from './en'

// Numbers in prose, spelled out to agree with a masculine noun (años):
// 1 → "un", 21 → "veintiún", 31 → "treinta y un". Digits from 100 on.
const UNITS = [
  'cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
]
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

function spell(n: number): string {
  if (n < 30) return UNITS[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` y ${UNITS[n % 10]}` : '')
  return String(n)
}

/** "Ocho años", ready to open a sentence. */
function yearsCount(n: number): string {
  const text = `${spell(n)} ${n === 1 ? 'año' : 'años'}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Spanish — the secondary language. Typed as `Messages`, so it can't miss a key. */
const es: Messages = {
  languages: {
    en: 'inglés',
    es: 'español',
  },

  dates: {
    locale: dateLocale,
    long: "d 'de' MMMM 'de' yyyy",
    short: 'd MMM yyyy',
  },

  categories: {
    Engineering: 'Ingeniería',
    Hobbies: 'Aficiones',
    'Personal Life': 'Vida personal',
  },

  // Tags that read the same in Spanish (python, docker, running, piano…) are left out.
  tags: {
    // Engineering
    'infrastructure': 'infraestructura',
    'api-design': 'diseño de APIs',
    'distributed systems': 'sistemas distribuidos',
    'cloud': 'nube',
    'networking': 'redes',
    'observability': 'observabilidad',
    'monitoring': 'monitorización',
    'performance': 'rendimiento',
    'security': 'seguridad',
    'architecture': 'arquitectura',
    'software design': 'diseño de software',
    'ai': 'IA',
    'leadership': 'liderazgo',
    'career': 'carrera profesional',
    'mentorship': 'mentoría',
    'open-source': 'código abierto',
    'tooling': 'herramientas',
    'productivity': 'productividad',
    // Hobbies
    'coding': 'programación',
    'hiking': 'senderismo',
    'cycling': 'ciclismo',
    'gear': 'equipo',
    'camping': 'acampada',
    'martial arts': 'artes marciales',
    'miniature painting': 'pintura de miniaturas',
    'boardgames': 'juegos de mesa',
    'videogames': 'videojuegos',
    'diy engineering': 'ingeniería DIY',
    '3d printing': 'impresión 3D',
    'astronomy': 'astronomía',
    'photography': 'fotografía',
    'astrophotography': 'astrofotografía',
    'photo editing': 'edición fotográfica',
    'illusionism': 'ilusionismo',
    'close up magic': 'magia de cerca',
    'tourism': 'turismo',
    'language learning': 'aprendizaje de idiomas',
    'cooking': 'cocina',
    'recipes': 'recetas',
    'coffee': 'café',
    // Personal Life
    'strength training': 'entrenamiento de fuerza',
    'bodybuilding': 'culturismo',
    'nutrition': 'nutrición',
    'self care': 'autocuidado',
    'sleep': 'sueño',
    'fashion': 'moda',
    'meditation': 'meditación',
    'stress management': 'gestión del estrés',
    'journaling': 'diario personal',
    'relax': 'relajación',
    'presence': 'presencia',
    'social skills': 'habilidades sociales',
    'personal finance': 'finanzas personales',
    'investing': 'inversión',
    'economics': 'economía',
    'learning': 'aprendizaje',
    'habits': 'hábitos',
    'reflection': 'reflexión',
    'goals': 'objetivos',
    'love': 'amor',
    'friendships': 'amistades',
    'social life': 'vida social',
    'communication': 'comunicación',
    'gratefulness': 'gratitud',
    'books': 'libros',
  },

  site: {
    tagline: 'Python, backends y cosas que merece la pena escribir.',
  },

  seo: {
    homeTitle: 'Joaquín · Blog — Python, backends y cosas que merece la pena escribir',
    homeDescription:
      'Mi rincón personal de internet: escribo con honestidad sobre Python e ingeniería backend, mis aficiones y la vida en Albacete.',
    aboutTitle: 'Sobre mí',
    aboutDescription:
      'Hola, soy Joaquín: ingeniero backend sénior en Allot, donde construyo software de ciberseguridad a gran escala. Por la noche, apunto un telescopio al cielo.',
    categoryDescription: category => `Artículos sobre ${category.toLowerCase()} en el blog personal de Joaquín.`,
    tagDescription: tag => `Artículos con la etiqueta #${tag} en el blog personal de Joaquín.`,
    notFoundTitle: 'Página no encontrada',
    defaultImageAlt: 'Yo con camisa blanca, apoyado en una barandilla de piedra en un parque',
  },

  common: {
    backToBlog: 'Volver al blog',
    allPosts: 'Todos los artículos',
    visitPortfolio: 'Visita mi portfolio →',
  },

  nav: {
    blog: 'Blog',
    about: 'Sobre mí',
    language: 'Idioma',
    toggleTheme: 'Cambiar tema',
    toggleMenu: 'Abrir o cerrar el menú',
  },

  footer: {
    builtWith: 'Hecho con FastAPI, React y café del bueno ☕',
    portfolio: 'Portfolio',
    about: 'Sobre mí',
    email: 'Correo',
  },

  languageDialog: {
    title: current => `Esta página está en ${current}`,
    body: preferred => `El blog también está disponible en ${preferred}. ¿Quieres cambiar?`,
    switchTo: preferred => `Cambiar a ${preferred}`,
    stayIn: current => `Seguir en ${current}`,
  },

  posts: {
    count: n => (n === 1 ? '1 artículo' : `${n} artículos`),
    readTime: minutes => `${minutes} min de lectura`,
    updated: date => `Actualizado el ${date}`,
    onlyIn: language => `Solo disponible en ${language}`,
    moreTags: n => `Mostrar ${n} etiqueta${n === 1 ? '' : 's'} más`,
    none: 'Todavía no hay artículos.',
    noneInCategory: 'Todavía no hay artículos en esta categoría.',
    noneWithTag: 'Todavía no hay artículos con esta etiqueta.',
  },

  pagination: {
    label: 'Paginación',
    previous: 'Página anterior',
    next: 'Página siguiente',
  },

  home: {
    badge: 'Blog personal',
    searchPlaceholder: 'Busca artículos por título, tema o palabra clave…',
    search: 'Buscar',
    inCategory: category => ` en ${category}`,
  },

  post: {
    notFound: 'Artículo no encontrado',
    untranslated: original =>
      `Este artículo aún no está traducido al español, así que estás leyendo la versión original en ${original}.`,
    signOff:
      'Quedan tantas historias por contar… que tu cielo siga lleno de sorpresas, tu brújula con caminos por explorar y tu horizonte, un poco más amplio.',
  },

  category: {
    fallbackTitle: 'Categoría',
  },

  search: {
    title: 'Buscar',
    resultsFor: query => `Resultados para «${query}»`,
    resultCount: n => (n === 1 ? '1 resultado' : `${n} resultados`),
    noResults: query => `No hay artículos que coincidan con «${query}»`,
    tryAnother: 'Prueba con otro término de búsqueda.',
  },

  notFound: {
    titleStart: 'Página',
    titleEnd: 'perdida',
    text: 'Esta página no existe. Puede que el artículo se haya movido o borrado.',
  },

  about: {
    greeting: 'Hola, soy Joaquín.',
    intro: {
      workBefore: 'Soy un ingeniero backend sénior en ',
      workAfter: years =>
        `, donde construyo software de ciberseguridad que procesa y protege el tráfico de proveedores de internet a gran escala. ${yearsCount(years)} de sistemas distribuidos, Python y proyectos de backend. En serio, he hecho de casi todo.`,
      notAll: '¡Pero eso no es todo!',
      passions:
        'Por las mañanas intento preparar el café perfecto, y por la noche apunto un telescopio al cielo y me pregunto qué habrá ahí fuera.',
      corner:
        'Este es mi rincón personal de internet. Ni un portfolio ni un CV: solo un sitio donde escribir con honestidad sobre ingeniería, aficiones y la vida en Albacete, una ciudad española de tamaño medio. Es mi diario personal, una pequeña ventana a mi mundo interior.',
    },
    currently: {
      heading: 'Ahora mismo',
      role: 'Desarrollador backend sénior de Python',
      at: ' en ',
      period: 'Mayo de 2025 – actualidad',
      description:
        'Formo parte del equipo de ASM, una plataforma SaaS de ciberseguridad que se vende a proveedores de internet de todo el mundo. Microservicios en Python, Kafka, Redis y MongoDB. Millones de eventos de seguridad procesados por segundo.',
      alsoBefore: 'También doy clases de Python avanzado en ',
      alsoAfter: ' y contribuyo activamente al software libre.',
    },
    gallery: {
      heading: 'Lejos del teclado',
      captions: {
        me: '¡Este soy yo!',
        astronomy: 'Astronomía',
        warhammer: 'Warhammer',
        barista: 'Café de barista',
        tourism: 'Mi viaje a Santorini',
        fiveADay: 'Five a Day, proyecto freelance',
      },
    },
    features: {
      engineering: {
        subtitle: 'Ingeniería',
        title: 'La afición que se convirtió en mi estilo de vida',
        text: years =>
          `${yearsCount(years)} construyendo sistemas distribuidos, arquitecturas orientadas a eventos, APIs y microservicios. Escribo sobre lo que funcionó, lo que se rompió y por qué. Los errores son el camino hacia la maestría y, sinceramente, me encanta mi trabajo.`,
        alt: 'Fragmento de código en Rust: un consumidor de eventos asíncrono que reintenta cada fallo como una lección aprendida',
      },
      hobbies: {
        subtitle: 'Aficiones',
        title: 'Un pedacito de mi vida',
        text: 'Noches de telescopio de una belleza imposible. Warhammer y largas sesiones de pintura con mis Custodes o mis Votann. Café, matcha y latte art. Bailes latinos. Muay thai, correr, senderismo… casi cualquier deporte.',
        alt: 'Una foto mía leyendo partituras de piano',
      },
      life: {
        subtitle: 'Vida y estilo',
        title: 'La persona detrás del código',
        text: 'Vivo en Albacete y trabajo en remoto. Bilingüe en español e inglés. Este blog es mi registro honesto: la ingeniería, las aficiones y todo lo que hay entre medias. Una instantánea de quien soy hoy que mañana será un bonito recuerdo.',
        alt: 'Una foto mía con mi pareja',
      },
    },
    project: {
      heading: 'Un proyecto del que estoy orgulloso',
      before: 'Estoy construyendo ',
      after:
        ', un diario que te escucha. Escribes, o simplemente hablas, sobre tus días, tus hábitos y las metas que persigues, y Joy lee entre líneas en silencio: un modelo de lenguaje percibe el ánimo de cada entrada, las notas de voz se convierten en texto y, cada semana, tus propias palabras vuelven a ti convertidas en reflexiones que no sabías que habías escrito. Bajo esa superficie tranquila late el tipo de sistema que me encanta construir: microservicios en Flask que se comunican por eventos a través de RabbitMQ, pipelines de NLP, MongoDB en el centro con almacenes de búsqueda y analítica a su lado, un frontend en React, inicio de sesión seguro y cada pieza en contenedores, lista para escalar en Kubernetes. Un diario por fuera; un sistema distribuido por dentro.',
    },
    readTheBlog: '← Leer el blog',
  },
}

export default es
