# Implementation Plan: WordPress Polylang Multilingual

## Overview

This implementation adds multilingual content support to the Next.js application using WordPress REST API with Polylang plugin. The approach uses language query parameters (`?lang=en` and `?lang=sv`), dynamic routing (`/[lang]/[slug]`), and real-time content fetching without caching.

## Tasks

- [ ] 1. Update WordPress API client with language parameter support
  - [x] 1.1 Add language parameter to all existing API functions
    - Modify `getSettings`, `getSite`, `getMenu`, `getPageById`, `getPageBySlug`, `getPostBySlug` to accept `lang` parameter with default value 'en'
    - Append `?lang={lang}` query parameter to all API URLs
    - Update cache configuration to `cache: 'no-store'` and `next: { revalidate: 0 }` for all fetch calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3_
  
  - [ ] 1.2 Write property test for API URL construction
    - **Property 1: API URL Construction with Language Parameters**
    - **Validates: Requirements 1.1, 1.4, 3.4, 3.5, 6.2, 8.1**
    - Test that all API URLs include `lang` parameter, `_embed`, and `acf_format=standard`
  
  - [ ] 1.3 Write property test for cache configuration
    - **Property 5: Cache Configuration**
    - **Validates: Requirements 4.1, 4.2**
    - Test that all fetch requests use `cache: 'no-store'` and `revalidate: 0`

- [ ] 2. Implement new content fetching functions
  - [x] 2.1 Create `getPage(slug, lang)` function
    - Write function that fetches page by slug with language parameter
    - Include `_embed` and `acf_format=standard` in query parameters
    - Return null for non-existent pages
    - Handle network errors gracefully with try-catch
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_
  
  - [x] 2.2 Create `getTranslations(pageId, lang)` function
    - Fetch Polylang translation metadata for a given page
    - Return TranslationMap with language codes mapped to page IDs and slugs
    - Handle missing Polylang data gracefully
    - _Requirements: 5.3, 7.2, 7.3_
  
  - [x] 2.3 Update `getLanguages()` function
    - Replace static language data with Polylang API integration
    - Fetch from `/wp-json/polylang/v1/languages` endpoint
    - Fall back to static data if Polylang API unavailable
    - _Requirements: 5.1, 7.1, 7.4, 7.5_
  
  - [ ] 2.4 Write property test for invalid slug handling
    - **Property 4: Invalid Slug Handling**
    - **Validates: Requirements 3.3, 10.1**
    - Test that getPage returns null for non-existent slugs without throwing errors
  
  - [ ] 2.5 Write property test for language-specific content retrieval
    - **Property 2: Language-Specific Content Retrieval**
    - **Validates: Requirements 2.2**
    - Test that fetched content corresponds to requested language
  
  - [ ] 2.6 Write unit tests for getPage function
    - Test successful page fetch with ACF fields
    - Test 404 handling
    - Test network error handling
    - _Requirements: 3.1, 3.2, 3.3, 10.2_

- [ ] 3. Create dynamic language route handler
  - [x] 3.1 Create `/app/[lang]/[slug]/page.tsx` route file
    - Implement async page component accepting `params: Promise<{ lang: string; slug: string }>`
    - Validate language code against supported languages ['en', 'sv']
    - Call `getPage(slug, lang)` to fetch content
    - Return 404 using `notFound()` for invalid language or missing page
    - Prevent homepage redirect loops by checking `page_on_front` setting
    - Render page using `WordPressPageRenderer` component
    - _Requirements: 2.1, 2.2, 2.3, 9.3, 9.4, 10.1_
  
  - [ ] 3.2 Write unit tests for language route handler
    - Test valid language codes (en, sv)
    - Test invalid language codes return 404
    - Test missing pages return 404
    - Test homepage redirect prevention
    - _Requirements: 2.1, 2.2, 2.3, 9.4, 10.1_

- [ ] 4. Update homepage routes for language support
  - [x] 4.1 Update `/app/page.tsx` for English homepage
    - Ensure all API calls pass `lang='en'` parameter
    - Fetch settings with `getSettings('en')`
    - Fetch homepage content with language parameter
    - _Requirements: 2.4, 9.1, 9.5_
  
  - [x] 4.2 Update `/app/sv/page.tsx` for Swedish homepage
    - Fetch settings with `getSettings('sv')`
    - Fetch Swedish homepage using `page_on_front` setting
    - Render using `DesignedHomepage` component
    - _Requirements: 2.5, 9.2, 9.5_
  
  - [ ] 4.3 Write unit tests for homepage routes
    - Test English homepage serves correct content
    - Test Swedish homepage serves correct content
    - Test ACF fields render correctly for each language
    - _Requirements: 2.4, 2.5, 9.1, 9.2, 9.5_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhance Language Switcher component
  - [x] 6.1 Add translation metadata support to LanguageSwitcher
    - Update `LanguageSwitcherProps` interface to include `currentPageId` and `translations`
    - Implement `handleLanguageSwitch` function with slug mapping logic
    - Check if translation exists in target language using `translations` prop
    - Navigate to translated slug if available: `/${targetLang}/${translatedSlug}`
    - Fall back to homepage if translation unavailable: `/` for English, `/sv` for Swedish
    - _Requirements: 5.2, 5.4, 5.5, 7.3_
  
  - [ ] 6.2 Add visual indicator for active language
    - Highlight current language option with background color
    - Update styling to show active state
    - _Requirements: 5.6_
  
  - [ ] 6.3 Write property test for language switcher navigation with translations
    - **Property 6: Language Switcher Navigation with Translations**
    - **Validates: Requirements 5.2, 5.4, 7.3**
    - Test that navigation uses translated slug when available
  
  - [ ] 6.4 Write property test for language switcher fallback navigation
    - **Property 7: Language Switcher Fallback Navigation**
    - **Validates: Requirements 5.5**
    - Test that navigation falls back to homepage when translation unavailable
  
  - [ ] 6.5 Write unit tests for language switcher
    - Test language dropdown opens and closes
    - Test navigation with available translations
    - Test fallback navigation without translations
    - Test active language indicator
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

- [ ] 7. Update page components to pass translation data
  - [ ] 7.1 Update route handlers to fetch and pass translations
    - In `/app/[lang]/[slug]/page.tsx`, call `getTranslations(page.id, lang)`
    - Pass translations to `WordPressPageRenderer` component
    - Update `WordPressPageRenderer` to accept and forward translations to layout
    - _Requirements: 5.3, 7.2_
  
  - [ ] 7.2 Update layout components to pass translations to LanguageSwitcher
    - Modify `Header` component to accept and pass translation data
    - Ensure `LanguageSwitcher` receives `currentPageId` and `translations` props
    - _Requirements: 5.3, 7.2_

- [ ] 8. Implement ACF field support and error handling
  - [ ] 8.1 Add ACF field validation and graceful handling
    - Update page rendering components to check for `page.acf` existence
    - Provide default values for missing ACF fields
    - Render pages without ACF-dependent sections when fields are missing
    - _Requirements: 6.3, 6.5, 10.3_
  
  - [ ] 8.2 Implement media URL resolution for ACF fields
    - Create helper function to resolve media IDs to URLs
    - Use `getMedia(id)` function for ACF media references
    - Handle missing media gracefully
    - _Requirements: 6.4_
  
  - [ ] 8.3 Write property test for ACF fields inclusion
    - **Property 3: ACF Fields Inclusion**
    - **Validates: Requirements 3.2, 6.1**
    - Test that pages with ACF fields include `acf` property in response
  
  - [ ] 8.4 Write property test for missing ACF graceful handling
    - **Property 10: Missing ACF Graceful Handling**
    - **Validates: Requirements 6.5, 10.3**
    - Test that pages without ACF fields render without errors
  
  - [ ] 8.5 Write unit tests for ACF field handling
    - Test ACF fields are accessible via `page.acf`
    - Test missing ACF fields don't crash
    - Test media ID resolution
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 9. Implement menu localization
  - [ ] 9.1 Update menu fetching to use language parameter
    - Ensure `getMenu(slug, lang)` is called with current page language
    - Update all menu fetch calls in layout components
    - _Requirements: 8.1, 8.2_
  
  - [ ] 9.2 Implement menu translation fallback
    - Add fallback logic to return English menu if translation unavailable
    - Handle empty menu responses gracefully
    - _Requirements: 8.3, 8.5_
  
  - [ ] 9.3 Write property test for menu language parameter
    - **Property 12: Menu Language Parameter**
    - **Validates: Requirements 8.1**
    - Test that menu URLs include correct `lang` parameter
  
  - [ ] 9.4 Write property test for menu translation fallback
    - **Property 13: Menu Translation Fallback**
    - **Validates: Requirements 8.5**
    - Test that missing menu translations fall back to English
  
  - [ ] 9.5 Write unit tests for menu localization
    - Test menu fetches with language parameter
    - Test menu displays in correct language
    - Test fallback to English menu
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. Implement comprehensive error handling
  - [ ] 10.1 Add error handling for network failures
    - Wrap all fetch calls in try-catch blocks
    - Log errors with context (endpoint, language, parameters)
    - Return null for content requests on error
    - Return empty arrays for list requests on error
    - _Requirements: 10.2, 10.5_
  
  - [ ] 10.2 Add error handling for Polylang API failures
    - Handle missing Polylang plugin gracefully
    - Fall back to single-language mode if Polylang unavailable
    - Log Polylang-specific errors
    - _Requirements: 7.4, 7.5_
  
  - [ ] 10.3 Add error handling for language switcher
    - Wrap navigation logic in try-catch
    - Keep user on current page if navigation fails
    - Display user-friendly error messages
    - _Requirements: 10.4, 10.5_
  
  - [ ] 10.4 Write property test for API unreachable error handling
    - **Property 15: API Unreachable Error Handling**
    - **Validates: Requirements 10.2**
    - Test that network failures return null without crashing
  
  - [ ] 10.5 Write property test for language switcher error handling
    - **Property 16: Language Switcher Error Handling**
    - **Validates: Requirements 10.4**
    - Test that navigation errors are handled gracefully
  
  - [ ] 10.6 Write unit tests for error handling
    - Test 404 responses
    - Test network timeouts
    - Test malformed API responses
    - Test missing translation handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Add TypeScript interfaces and type definitions
  - [x] 11.1 Create type definitions for WordPress API responses
    - Define `WordPressPage` interface with ACF and Polylang fields
    - Define `Language` interface
    - Define `TranslationMap` interface
    - Define `SupportedLanguage` type
    - Add types to lib/wp.ts
    - _Requirements: All requirements (type safety)_
  
  - [x] 11.2 Create language configuration constants
    - Define `SUPPORTED_LANGUAGES` constant array
    - Define `LANGUAGE_CONFIG` object with name, flag, and homePath
    - Export from lib/wp.ts or separate config file
    - _Requirements: 1.2, 2.1, 5.1_

- [ ] 12. Final checkpoint - Integration testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Implementation uses TypeScript with Next.js 14+ App Router
- No static caching is used - all content is fetched fresh on each request
- Language switcher requires translation metadata from Polylang API
- ACF fields are included automatically with `acf_format=standard` parameter
