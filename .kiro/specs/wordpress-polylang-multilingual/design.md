# Design Document: WordPress Polylang Multilingual

## Overview

This design implements multilingual content support for a Next.js 14+ App Router application integrated with WordPress REST API and the Polylang plugin. The system enables seamless language switching between English (en) and Swedish (sv) with proper routing, content fetching, and slug mapping.

The architecture follows Next.js App Router conventions with server-side rendering, leveraging WordPress REST API endpoints enhanced by Polylang's language query parameters. The design prioritizes real-time content updates (no static caching), clean URL structures, and graceful error handling.

### Key Design Decisions

1. **Query Parameter Approach**: Use `?lang=en` and `?lang=sv` query parameters on WordPress REST API calls rather than separate API endpoints
2. **Route Structure**: Implement `/[lang]/[slug]` pattern for language-specific pages, with `/` for English and `/sv` for Swedish homepage
3. **No Static Caching**: Set `revalidate: 0` and `cache: 'no-store'` to ensure fresh content on every request
4. **Slug Mapping**: Leverage Polylang's translation metadata to map slugs between languages for language switcher navigation
5. **Graceful Degradation**: Handle missing translations, API errors, and missing ACF data without breaking the application

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   / (root)   │  │  /sv (home)  │  │ /[lang]/     │      │
│  │   page.tsx   │  │   page.tsx   │  │ [slug]/      │      │
│  │              │  │              │  │ page.tsx     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Content Layer │                        │
│                    │   (lib/wp.ts)  │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  WordPress API   │
                    │  + Polylang      │
                    └──────────────────┘
```

### Data Flow

1. **User Request**: Browser requests `/sv/om-oss`
2. **Route Matching**: Next.js matches `/[lang]/[slug]` route
3. **Content Fetching**: Server calls `getPage('om-oss', 'sv')`
4. **API Request**: Fetch `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=om-oss&lang=sv&_embed&acf_format=standard`
5. **Response Processing**: Parse JSON, extract ACF fields, resolve media
6. **Rendering**: Server renders page with Swedish content
7. **Client Hydration**: Language switcher becomes interactive

### Language Detection Strategy

- **Root path `/`**: Serves English homepage (default)
- **Path `/sv`**: Serves Swedish homepage
- **Path `/[lang]/[slug]`**: Extracts language from URL segment
- **Fallback**: Default to English if language code is invalid

## Components and Interfaces

### 1. Content Fetcher Service (`lib/wp.ts`)

Enhanced WordPress API client with language parameter support.

#### New Functions

```typescript
// Fetch page by slug with language support
export async function getPage(slug: string, lang: string = 'en'): Promise<WordPressPage | null>

// Fetch languages from Polylang
export async function getLanguages(): Promise<Language[]>

// Get translation links for a page
export async function getTranslations(pageId: number, lang: string = 'en'): Promise<TranslationMap>
```

#### Modified Functions

All existing functions (`getSettings`, `getSite`, `getMenu`, `getPageById`, `getPageBySlug`, `getPostBySlug`) will be updated to:
- Accept `lang` parameter (default: 'en')
- Append `?lang={lang}` to API URLs
- Set `cache: 'no-store'` and `next: { revalidate: 0 }`

#### Interface Definitions

```typescript
interface WordPressPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  acf?: Record<string, any>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
  polylang_translations?: TranslationMap;
}

interface Language {
  code: string;
  name: string;
  url: string;
  flag: string;
  slug?: string;
}

interface TranslationMap {
  [langCode: string]: {
    id: number;
    slug: string;
    href: string;
  };
}
```

### 2. Dynamic Route Handler (`app/[lang]/[slug]/page.tsx`)

New route handler for language-specific pages.

```typescript
interface PageParams {
  lang: string;
  slug: string;
}

export default async function LanguagePage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  const { lang, slug } = await params;
  
  // Validate language code
  if (!['en', 'sv'].includes(lang)) {
    notFound();
  }
  
  // Fetch page content
  const page = await getPage(slug, lang);
  
  if (!page) {
    notFound();
  }
  
  // Prevent homepage redirect loops
  const settings = await getSettings(lang);
  if (page.id === settings.page_on_front) {
    redirect(lang === 'en' ? '/' : `/${lang}`);
  }
  
  return <WordPressPageRenderer page={page} />;
}
```

### 3. Language Switcher Component (`components/LanguageSwitcher.tsx`)

Enhanced to support slug mapping and proper navigation.

#### Key Enhancements

- Fetch current page translations using `getTranslations()`
- Map current slug to translated slug
- Navigate to translated page or homepage fallback
- Display active language indicator
- Handle translation unavailability gracefully

```typescript
interface LanguageSwitcherProps {
  languages: Language[];
  currentLang: string;
  currentPageId?: number;
  translations?: TranslationMap;
}

export default function LanguageSwitcher({
  languages,
  currentLang,
  currentPageId,
  translations
}: LanguageSwitcherProps) {
  const router = useRouter();
  
  const handleLanguageSwitch = (targetLang: string) => {
    // Check if translation exists
    if (translations && translations[targetLang]) {
      const translatedSlug = translations[targetLang].slug;
      router.push(`/${targetLang}/${translatedSlug}`);
    } else {
      // Fallback to homepage
      router.push(targetLang === 'en' ? '/' : `/${targetLang}`);
    }
  };
  
  // ... rest of component
}
```

### 4. Homepage Routes

#### English Homepage (`app/page.tsx`)

Remains largely unchanged, but ensures `lang='en'` is passed to all API calls.

```typescript
export default async function Home() {
  const settings = await getSettings('en');
  const page = await getPageById(settings.page_on_front, 'en');
  return <DesignedHomepage page={page} />;
}
```

#### Swedish Homepage (`app/sv/page.tsx`)

Updated to fetch Swedish content properly.

```typescript
export default async function SwedishHome() {
  const settings = await getSettings('sv');
  const page = await getPageById(settings.page_on_front, 'sv');
  return <DesignedHomepage page={page} />;
}
```

## Data Models

### WordPress API Response Structure

#### Page Response with Polylang

```json
{
  "id": 123,
  "slug": "om-oss",
  "title": {
    "rendered": "Om Oss"
  },
  "content": {
    "rendered": "<p>Swedish content...</p>"
  },
  "acf": {
    "hero_title": "Välkommen",
    "hero_image": 456
  },
  "_embedded": {
    "wp:featuredmedia": [{
      "source_url": "https://example.com/image.jpg"
    }]
  },
  "polylang_translations": {
    "en": {
      "id": 122,
      "slug": "about-us",
      "href": "https://example.com/wp-json/wp/v2/pages/122"
    },
    "sv": {
      "id": 123,
      "slug": "om-oss",
      "href": "https://example.com/wp-json/wp/v2/pages/123"
    }
  }
}
```

### Language Configuration

```typescript
const SUPPORTED_LANGUAGES = ['en', 'sv'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  name: string;
  flag: string;
  homePath: string;
}> = {
  en: {
    name: 'English',
    flag: 'data:image/png;base64,...',
    homePath: '/'
  },
  sv: {
    name: 'Svenska',
    flag: 'data:image/png;base64,...',
    homePath: '/sv'
  }
};
```

### Cache Configuration

```typescript
const CACHE_CONFIG = {
  pages: { revalidate: 0, cache: 'no-store' as const },
  menus: { revalidate: 0, cache: 'no-store' as const },
  settings: { revalidate: 0, cache: 'no-store' as const },
  media: { revalidate: 0, cache: 'no-store' as const }
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following redundancies were identified and consolidated:

- **URL Parameter Properties (1.1, 1.4, 3.4, 3.5, 6.2, 8.1)**: All relate to ensuring correct query parameters are appended to API URLs. Consolidated into Property 1.
- **ACF Field Properties (3.2, 6.1)**: Both test that ACF fields are included in responses. Consolidated into Property 3.
- **Missing ACF Handling (6.5, 10.3)**: Both test graceful handling of missing ACF data. Consolidated into Property 4.
- **Homepage Route Examples (2.4, 9.1) and (2.5, 9.2)**: Duplicate examples, kept only in examples section.

### Property 1: API URL Construction with Language Parameters

*For any* WordPress API request (pages, posts, menus, settings), the constructed URL should include the `lang` query parameter with the specified language code, and should include required parameters like `_embed` and `acf_format=standard` where applicable.

**Validates: Requirements 1.1, 1.4, 3.4, 3.5, 6.2, 8.1**

### Property 2: Language-Specific Content Retrieval

*For any* valid slug and language code combination, when fetching page content, the returned data should correspond to the requested language version of that slug.

**Validates: Requirements 2.2**

### Property 3: ACF Fields Inclusion

*For any* page that has ACF fields defined in WordPress, when fetching that page's data, the response should include an `acf` property containing the custom field data.

**Validates: Requirements 3.2, 6.1**

### Property 4: Invalid Slug Handling

*For any* non-existent or invalid slug, when calling getPage, the function should return null without throwing errors.

**Validates: Requirements 3.3, 10.1**

### Property 5: Cache Configuration

*For all* WordPress API fetch requests, the fetch options should include `cache: 'no-store'` and `next: { revalidate: 0 }` to prevent caching.

**Validates: Requirements 4.1, 4.2**

### Property 6: Language Switcher Navigation with Translations

*For any* page with available translations, when a user switches to a different language, the navigation should use the translated slug from the Polylang translation metadata.

**Validates: Requirements 5.2, 5.4, 7.3**

### Property 7: Language Switcher Fallback Navigation

*For any* page without a translation in the target language, when a user switches languages, the navigation should redirect to the homepage of the target language.

**Validates: Requirements 5.5**

### Property 8: Translation Metadata Retrieval

*For any* page fetched from WordPress, when Polylang is active, the response should include translation metadata mapping language codes to translated page IDs and slugs.

**Validates: Requirements 5.3, 7.2**

### Property 9: Media URL Resolution

*For any* ACF field containing a media reference (ID), when fetching page data, the media ID should be resolved to a full URL using the WordPress media endpoint.

**Validates: Requirements 6.4**

### Property 10: Missing ACF Graceful Handling

*For any* page without ACF fields, when fetching and rendering that page, the application should handle the missing data gracefully without errors or crashes.

**Validates: Requirements 6.5, 10.3**

### Property 11: Polylang API Error Handling

*For any* Polylang API request that fails (network error, 404, 500), the Content_Fetcher should handle the error gracefully, log it, and return appropriate fallback data (empty array or null).

**Validates: Requirements 7.4**

### Property 12: Menu Language Parameter

*For any* menu fetch request, the API URL should include the `lang` parameter matching the current page language.

**Validates: Requirements 8.1**

### Property 13: Menu Translation Fallback

*For any* menu that doesn't exist in the requested language, when fetching menu data, the system should fall back to the default language (English) menu.

**Validates: Requirements 8.5**

### Property 14: Settings Language Parameter

*For any* settings fetch request, the API URL should include the `lang` parameter to retrieve language-specific settings like `page_on_front`.

**Validates: Requirements 9.3**

### Property 15: API Unreachable Error Handling

*For any* WordPress API request that fails due to network unreachability, the Content_Fetcher should log the error and return null without crashing.

**Validates: Requirements 10.2**

### Property 16: Language Switcher Error Handling

*For any* navigation error during language switching, the Language_Switcher should handle the error gracefully and keep the user on the current page.

**Validates: Requirements 10.4**

## Error Handling

### Error Categories and Strategies

#### 1. Network Errors

**Scenario**: WordPress API is unreachable or times out

**Strategy**:
- Wrap all fetch calls in try-catch blocks
- Log errors with context (endpoint, language, parameters)
- Return null for content requests
- Return empty arrays for list requests (menus, languages)
- Display user-friendly error messages in UI components

```typescript
try {
  const res = await fetch(url, options);
  if (!res.ok) {
    console.error(`[getPage] Failed: ${res.status} ${res.statusText}`);
    return null;
  }
  return await res.json();
} catch (error) {
  console.error(`[getPage] Network error:`, error);
  return null;
}
```

#### 2. Missing Content

**Scenario**: Page or post doesn't exist in requested language

**Strategy**:
- Return null from fetch functions
- Use Next.js `notFound()` in route handlers to show 404 page
- Provide language-specific 404 pages

```typescript
const page = await getPage(slug, lang);
if (!page) {
  notFound(); // Triggers Next.js 404 page
}
```

#### 3. Missing Translations

**Scenario**: Page exists in one language but not another

**Strategy**:
- Check translation metadata before navigation
- Fall back to homepage of target language
- Display message indicating translation unavailable

```typescript
if (translations && translations[targetLang]) {
  router.push(`/${targetLang}/${translations[targetLang].slug}`);
} else {
  router.push(targetLang === 'en' ? '/' : `/${targetLang}`);
  // Optional: Show toast notification
}
```

#### 4. Missing ACF Data

**Scenario**: Page exists but ACF fields are not defined

**Strategy**:
- Check for `page.acf` existence before accessing fields
- Provide default values for critical fields
- Render page without ACF-dependent sections

```typescript
const heroTitle = page.acf?.hero_title || page.title.rendered;
const heroImage = page.acf?.hero_image || null;

if (!heroImage) {
  // Render without hero image section
}
```

#### 5. Invalid Language Codes

**Scenario**: User accesses `/fr/about` (unsupported language)

**Strategy**:
- Validate language code against `SUPPORTED_LANGUAGES` array
- Return 404 for invalid language codes
- Redirect to English version as fallback (optional)

```typescript
if (!['en', 'sv'].includes(lang)) {
  notFound();
}
```

#### 6. Redirect Loops

**Scenario**: Homepage detection causes infinite redirects

**Strategy**:
- Check if fetched page ID matches `page_on_front` setting
- Only redirect if not already on homepage route
- Use early returns to prevent multiple redirects

```typescript
const settings = await getSettings(lang);
if (page.id === settings.page_on_front) {
  // Only redirect if we're not already on the homepage route
  if (slug !== undefined) {
    redirect(lang === 'en' ? '/' : `/${lang}`);
  }
}
```

### Error Logging Strategy

- Use structured logging with context
- Include language, slug, endpoint, and error details
- Differentiate between expected errors (404) and unexpected errors (network failures)
- Consider integrating error tracking service (Sentry, LogRocket) for production

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

### Unit Testing Focus

Unit tests should cover:

1. **Specific Examples**:
   - Fetching English homepage returns correct content
   - Fetching Swedish "om-oss" page returns Swedish content
   - Language switcher displays both English and Swedish options
   - Root path `/` serves English homepage
   - Path `/sv` serves Swedish homepage

2. **Edge Cases**:
   - Invalid language codes return 404
   - Missing translations fall back to homepage
   - Homepage redirect loop prevention
   - Empty or whitespace slugs
   - Special characters in slugs

3. **Error Conditions**:
   - Network failures return null
   - 404 responses handled gracefully
   - Missing ACF data doesn't crash
   - Malformed API responses handled

4. **Integration Points**:
   - Language switcher navigation triggers correct routes
   - Menu fetching includes language parameter
   - Settings fetching includes language parameter

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: wordpress-polylang-multilingual, Property {number}: {property_text}`

**Property Test Examples**:

```typescript
import fc from 'fast-check';

// Property 1: API URL Construction
test('Feature: wordpress-polylang-multilingual, Property 1: API URL Construction with Language Parameters', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('en', 'sv'),
      fc.string({ minLength: 1, maxLength: 50 }),
      (lang, slug) => {
        const url = constructPageUrl(slug, lang);
        expect(url).toContain(`lang=${lang}`);
        expect(url).toContain('_embed');
        expect(url).toContain('acf_format=standard');
      }
    ),
    { numRuns: 100 }
  );
});

// Property 4: Invalid Slug Handling
test('Feature: wordpress-polylang-multilingual, Property 4: Invalid Slug Handling', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => !isValidSlug(s)),
      fc.constantFrom('en', 'sv'),
      async (invalidSlug, lang) => {
        const result = await getPage(invalidSlug, lang);
        expect(result).toBeNull();
      }
    ),
    { numRuns: 100 }
  );
});

// Property 7: Language Switcher Fallback Navigation
test('Feature: wordpress-polylang-multilingual, Property 7: Language Switcher Fallback Navigation', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('en', 'sv'),
      fc.integer({ min: 1, max: 1000 }),
      (targetLang, pageId) => {
        const translations = {}; // No translations available
        const targetUrl = getLanguageSwitchUrl(pageId, targetLang, translations);
        const expectedUrl = targetLang === 'en' ? '/' : '/sv';
        expect(targetUrl).toBe(expectedUrl);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Data Generation

**Generators for Property Tests**:
- Valid language codes: `fc.constantFrom('en', 'sv')`
- Valid slugs: `fc.string({ minLength: 1, maxLength: 100 }).filter(isValidSlug)`
- Invalid slugs: `fc.string().filter(s => !isValidSlug(s))`
- Page IDs: `fc.integer({ min: 1, max: 10000 })`
- Translation maps: `fc.record({ en: pageDataArb, sv: pageDataArb })`

### Testing Checklist

- [ ] All 16 correctness properties have corresponding property-based tests
- [ ] Each property test runs minimum 100 iterations
- [ ] All property tests are tagged with feature name and property number
- [ ] Unit tests cover all specific examples from requirements
- [ ] Edge cases (invalid languages, missing translations, redirect loops) have unit tests
- [ ] Error handling paths have unit tests
- [ ] Integration tests verify language switcher navigation
- [ ] Mock WordPress API responses for consistent testing
- [ ] Test both successful and failure scenarios for all API calls

