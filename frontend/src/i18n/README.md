# i18n — English and Spanish

The public site is published in **English (primary)** and **Spanish (secondary)**.
The admin pages stay in English.

## Layout

| File | What it holds |
| --- | --- |
| `config.ts` | Supported languages, the default (`en`), names and short codes. |
| `detect.ts` | The reader's language: their saved choice, else their browser's, else English. |
| `paths.ts` | `withLang('es', '/about')` → `/es/about`, and `stripLang` for the reverse. |
| `locales/en.ts` | Every UI string in English. **Its shape is the `Messages` type.** |
| `locales/es.ts` | The Spanish strings, typed as `Messages`, so a missing key fails the build. |
| `LanguageContext.tsx` | `useI18n()` → `{ lang, m, path, date, category, tag }`. |
| `content.ts` | The per-language parts of a post (title, excerpt, body) for the composer. |

The UI pieces live in `components/i18n/`. `LangLayout` is the `/:lang` route and
`LangRedirect` handles paths without a language. `LanguageSwitcher` is the
navbar's EN | ES control, `LanguageMismatchDialog` is the "read it in your
language?" prompt, and `ContentLangToggle` is the composer's ENG / ESP switch.

## URLs

Every public page lives under its language: `/en/posts/x` and `/es/posts/x` show
the same post. A path without a language goes to the same page in the reader's
language: `/`, and links from before the site was bilingual such as
`/posts/x`. Admin paths have no prefix.

When someone opens a page in the other language (a shared link, say), a dialog
offers their own. It's written in their language. Either answer is remembered in
`localStorage` (`lang`), as is any use of the navbar switch.

## Writing a component

```tsx
const { m, path, date, category, tag } = useI18n()

<Link to={path('/about')}>{m.nav.about}</Link>   // never a bare '/about'
<time>{date(post.publishedAt)}</time>            // or date(iso, 'short')
{category(post.category)} {tag('hiking')}        // stored in English, shown translated
```

To add a string, add it to `locales/en.ts` first; TypeScript then points at
`es.ts` until it has the translation too. Plurals and anything with a value in
it are functions, such as `posts.count(n)` and `search.resultsFor(query)`.
Numbers inside prose are spelled out by each locale's own `yearsCount`, up to
99 (21 → "Twenty-one years" / "Veintiún años"). The About page's years of
experience count from `CAREER_START` in `data/index.ts`.

Category and tag names are stored in English. `es.ts` maps them in
`categories` / `tags`, and anything not listed shows as stored. Tags that read
the same in both languages (`python`, `docker`, `running`…) stay out of the map.

## Posts

A post has English fields (`title`, `excerpt`, `body`, required) plus a Spanish
translation (`titleEs`, `excerptEs`, `bodyEs`). The cover image, category, tags
and draft flag are shared. Spanish counts as published once it has a title and
a body. Until then, the Spanish site shows the English text with a notice, and
cards mark it **EN**.

The API takes `?lang=es` on lists, single posts, search and the feed. Responses
carry `lang` (the language actually returned) and `availableLangs`.

## Adding a language

1. Add it to `SUPPORTED_LANGS`, `LANG_NAMES` and `LANG_CODES` in `config.ts`.
2. Create `locales/<code>.ts` typed as `Messages` and register it in `locales/index.ts`.
3. Add its name to `languages` in every locale.
4. On the backend: add it to the `Lang` enum, then add the columns, the search vector and the startup migration (see `title_es`).
5. In the composer: add its label in `ContentLangToggle.tsx` and its fields in `adminContent` and the save payloads.
