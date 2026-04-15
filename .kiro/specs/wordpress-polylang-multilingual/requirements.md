# Requirements Document

## Introduction

This feature implements multilingual content support for a Next.js App Router application using WordPress REST API with the Polylang plugin. The system enables users to view content in multiple languages (English and Swedish) with proper routing, language switching, and content fetching capabilities. The implementation uses query parameters for language selection, dynamic routes for content pages, and includes support for Advanced Custom Fields (ACF).

## Glossary

- **Next.js_App**: The Next.js application using App Router architecture
- **WordPress_API**: The WordPress REST API endpoint providing content
- **Polylang_Plugin**: WordPress plugin managing multilingual content
- **Language_Switcher**: UI component allowing users to change language
- **Content_Fetcher**: Service layer fetching WordPress content via REST API
- **Route_Handler**: Next.js dynamic route handling page requests
- **ACF**: Advanced Custom Fields WordPress plugin for custom data
- **Slug_Mapper**: Component mapping page slugs between languages
- **Cache_Controller**: System managing content caching behavior

## Requirements

### Requirement 1: Language Query Parameter Support

**User Story:** As a developer, I want to fetch WordPress content using language query parameters, so that the correct language version is retrieved from Polylang.

#### Acceptance Criteria

1. WHEN the Content_Fetcher requests content, THE Content_Fetcher SHALL append the ?lang parameter to WordPress API URLs
2. THE Content_Fetcher SHALL support "en" and "sv" as valid language codes
3. WHEN no language parameter is provided, THE Content_Fetcher SHALL default to "en"
4. THE Content_Fetcher SHALL include the language parameter in all WordPress REST API requests (pages, posts, menus, settings)

### Requirement 2: Dynamic Route Structure

**User Story:** As a user, I want to access pages using /[lang]/[slug] URLs, so that I can view content in my preferred language with clean URLs.

#### Acceptance Criteria

1. THE Route_Handler SHALL support the pattern /[lang]/[slug] for dynamic page routing
2. WHEN a user accesses /en/about, THE Route_Handler SHALL fetch the English version of the "about" page
3. WHEN a user accesses /sv/om-oss, THE Route_Handler SHALL fetch the Swedish version of the "om-oss" page
4. WHEN a user accesses the root path /, THE Route_Handler SHALL serve the English homepage
5. WHEN a user accesses /sv, THE Route_Handler SHALL serve the Swedish homepage

### Requirement 3: Content Fetching Function

**User Story:** As a developer, I want a getPage(slug, lang) function, so that I can retrieve page content for any language consistently.

#### Acceptance Criteria

1. THE Content_Fetcher SHALL provide a getPage function accepting slug and lang parameters
2. WHEN getPage is called with valid parameters, THE Content_Fetcher SHALL return page data including ACF fields
3. WHEN getPage is called with an invalid slug, THE Content_Fetcher SHALL return null
4. THE Content_Fetcher SHALL format ACF fields using acf_format=standard parameter
5. THE Content_Fetcher SHALL include embedded media data using the _embed parameter

### Requirement 4: No Caching on Vercel

**User Story:** As a content editor, I want content updates to appear immediately, so that changes are visible without deployment delays.

#### Acceptance Criteria

1. THE Cache_Controller SHALL set revalidate to 0 for all WordPress API fetch requests
2. THE Cache_Controller SHALL use cache: 'no-store' option for fetch requests
3. WHEN content is updated in WordPress, THE Next.js_App SHALL fetch fresh content on the next request
4. THE Next.js_App SHALL NOT use static generation for dynamic language routes

### Requirement 5: Language Switcher with Slug Mapping

**User Story:** As a user, I want to switch languages while staying on the same content, so that I can read the current page in my preferred language.

#### Acceptance Criteria

1. THE Language_Switcher SHALL display available languages with flag icons
2. WHEN a user clicks a language option, THE Language_Switcher SHALL navigate to the equivalent page in the selected language
3. THE Slug_Mapper SHALL retrieve translated slug mappings from Polylang API
4. WHEN a slug mapping exists, THE Language_Switcher SHALL use the translated slug for navigation
5. WHEN no slug mapping exists, THE Language_Switcher SHALL navigate to the homepage of the selected language
6. THE Language_Switcher SHALL indicate the currently active language visually

### Requirement 6: ACF Field Support

**User Story:** As a developer, I want to access ACF fields in fetched page data, so that I can render custom content fields in components.

#### Acceptance Criteria

1. WHEN the Content_Fetcher retrieves page data, THE Content_Fetcher SHALL include ACF fields in the response
2. THE Content_Fetcher SHALL use acf_format=standard to ensure consistent ACF data structure
3. THE Next.js_App SHALL access ACF fields via the page.acf property
4. WHEN ACF fields contain media references, THE Content_Fetcher SHALL resolve media URLs
5. THE Content_Fetcher SHALL handle missing ACF fields gracefully without errors

### Requirement 7: Polylang API Integration

**User Story:** As a developer, I want to integrate with Polylang's REST API endpoints, so that I can retrieve language metadata and translations.

#### Acceptance Criteria

1. THE Content_Fetcher SHALL fetch available languages from Polylang API
2. WHEN fetching page data, THE Content_Fetcher SHALL include Polylang translation metadata
3. THE Slug_Mapper SHALL use Polylang's translation links to map slugs between languages
4. THE Content_Fetcher SHALL handle Polylang API errors gracefully with fallback behavior
5. WHEN Polylang data is unavailable, THE Next.js_App SHALL continue functioning with default language only

### Requirement 8: Menu Localization

**User Story:** As a user, I want to see navigation menus in my selected language, so that menu items match the current language context.

#### Acceptance Criteria

1. WHEN fetching menu data, THE Content_Fetcher SHALL include the lang parameter
2. THE Next.js_App SHALL display menu items in the current page language
3. WHEN switching languages, THE Next.js_App SHALL load the corresponding language menu
4. THE Content_Fetcher SHALL cache menu data per language separately
5. WHEN a menu translation is unavailable, THE Content_Fetcher SHALL fall back to the default language menu

### Requirement 9: Homepage Language Routing

**User Story:** As a user, I want the homepage to respect my language preference, so that I see the correct language version when visiting the root URL.

#### Acceptance Criteria

1. WHEN a user accesses /, THE Route_Handler SHALL serve the English homepage
2. WHEN a user accesses /sv, THE Route_Handler SHALL serve the Swedish homepage
3. THE Content_Fetcher SHALL fetch the page_on_front setting with the appropriate language parameter
4. THE Route_Handler SHALL prevent redirect loops between language-specific homepages
5. WHEN the homepage has ACF fields, THE Next.js_App SHALL render them correctly for each language

### Requirement 10: Error Handling and Fallbacks

**User Story:** As a user, I want graceful error handling when content is unavailable, so that I receive helpful feedback instead of broken pages.

#### Acceptance Criteria

1. WHEN a page is not found in the requested language, THE Route_Handler SHALL return a 404 response
2. WHEN the WordPress API is unreachable, THE Content_Fetcher SHALL log the error and return null
3. WHEN ACF data is missing, THE Next.js_App SHALL render the page without ACF content
4. WHEN language switching fails, THE Language_Switcher SHALL remain on the current page
5. THE Next.js_App SHALL display user-friendly error messages for all failure scenarios
