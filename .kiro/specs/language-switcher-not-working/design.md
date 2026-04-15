# Language Switcher Not Working Bugfix Design

## Overview

The language switcher component in the header displays correctly but does not navigate to translated pages when clicked. Instead, it falls back to the homepage of the target language. The root cause is a data flow issue: the `LanguageSwitcher` component requires `currentPageId` and `translations` props to perform proper language switching with slug mapping, but these props are never passed from the page route handlers through the component tree.

The fix involves threading translation data through the component hierarchy by:
1. Fetching translation metadata in route handlers using `getTranslations(pageId, lang)`
2. Modifying the `Header` component to accept and forward translation props
3. Ensuring the `LanguageSwitcher` receives the required data to navigate correctly

This is a minimal, targeted fix that preserves all existing functionality while enabling proper language switching.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user clicks a language option in the switcher but the `translations` prop is undefined, causing fallback to homepage navigation
- **Property (P)**: The desired behavior when language switching occurs - the system should navigate to the translated version of the current page using the correct slug from Polylang metadata
- **Preservation**: Existing behaviors that must remain unchanged - homepage language switching, visual display of language options, fallback behavior when no translation exists
- **LanguageSwitcher**: The client component in `components/LanguageSwitcher.tsx` that renders the language dropdown and handles navigation
- **Header**: The server component in `components/Header.tsx` that renders the site header and contains the LanguageSwitcher
- **getTranslations**: The function in `lib/wp.ts` that fetches Polylang translation metadata for a given page ID
- **TranslationMap**: A TypeScript interface mapping language codes to translation objects containing `id`, `slug`, and `href`
- **Route Handlers**: Next.js page components in `app/` directory that fetch data and render pages

## Bug Details

### Bug Condition

The bug manifests when a user clicks on a language option in the language switcher dropdown while viewing a non-homepage page. The `LanguageSwitcher` component's `handleLanguageSwitch` function checks for translation data in the `translations` prop, but this prop is always undefined because it's never passed from the route handlers through the Header component.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { clickEvent: MouseEvent, targetLang: string, currentPageId: number, translations: TranslationMap | undefined }
  OUTPUT: boolean
  
  RETURN input.clickEvent.type === 'click'
         AND input.targetLang IN ['en', 'sv']
         AND input.currentPageId !== homepageId
         AND input.translations === undefined
END FUNCTION
```

### Examples

- **Example 1**: User is on `/sv/virtual-server` (Swedish Virtual Server page) and clicks "English" in the language switcher
  - Expected: Navigate to `/virtual-server` (English version)
  - Actual: Navigate to `/` (English homepage) because `translations` is undefined

- **Example 2**: User is on `/domains` (English Domains page) and clicks "Svenska" in the language switcher
  - Expected: Navigate to `/sv/domaner` (Swedish version with translated slug)
  - Actual: Navigate to `/sv` (Swedish homepage) because `translations` is undefined

- **Example 3**: User is on `/about-bluerange` (English About page) and clicks "Svenska" in the language switcher
  - Expected: Navigate to `/sv/om-bluerange` (Swedish version)
  - Actual: Navigate to `/sv` (Swedish homepage) because `translations` is undefined

- **Edge Case**: User is on a page that has no translation in the target language
  - Expected: Navigate to homepage of target language (fallback behavior)
  - Actual: Same as expected (this already works correctly)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Homepage language switching must continue to work (switching between `/` and `/sv`)
- Language switcher dropdown display with flag icons must remain unchanged
- Visual indication of the current active language must remain unchanged
- Fallback to homepage when no translation exists must continue to work
- Language switcher positioning and styling must remain unchanged

**Scope:**
All inputs that do NOT involve clicking the language switcher on a non-homepage page should be completely unaffected by this fix. This includes:
- Homepage language switching (already works)
- Language switcher visual display and dropdown behavior
- Navigation menu functionality
- Page rendering and content display
- Any other header functionality

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is a data flow issue in the component hierarchy:

1. **Missing Data Fetching**: Route handlers (`app/[lang]/[slug]/page.tsx`, `app/[slug]/page.tsx`) fetch page data but do not call `getTranslations(page.id, lang)` to retrieve translation metadata from Polylang

2. **Component Prop Interface Gap**: The `Header` component does not accept `currentPageId` or `translations` props in its interface, so even if route handlers fetched this data, there's no way to pass it

3. **Data Threading Failure**: The component tree (Route Handler → Layout → Header → LanguageSwitcher) does not thread translation data through, leaving the LanguageSwitcher with undefined props

4. **Server/Client Component Boundary**: The Header is a server component and LanguageSwitcher is a client component, requiring careful prop passing across this boundary

## Correctness Properties

Property 1: Bug Condition - Language Switcher Navigates to Translated Page

_For any_ user interaction where a language option is clicked in the language switcher while viewing a non-homepage page that has a translation in the target language, the fixed system SHALL navigate to the translated version of the current page using the correct slug from Polylang metadata, rather than falling back to the homepage.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Existing Language Switcher Behavior

_For any_ user interaction that does NOT involve clicking the language switcher on a non-homepage page (including homepage language switching, dropdown display, visual styling, and fallback behavior when no translation exists), the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the following changes are needed:

**File 1**: `app/[lang]/[slug]/page.tsx`

**Function**: `LanguagePage` (default export)

**Specific Changes**:
1. **Fetch Translation Data**: After fetching the page, call `getTranslations(page.id, lang)` to retrieve translation metadata
2. **Pass to Renderer**: Modify the `WordPressPageRenderer` call to accept and forward `currentPageId` and `translations` props

**File 2**: `app/[slug]/page.tsx`

**Function**: `Page` (default export)

**Specific Changes**:
1. **Fetch Translation Data**: After fetching the page, call `getTranslations(data.id, 'en')` to retrieve translation metadata
2. **Pass to Renderer**: Modify the `WordPressPageRenderer` call to accept and forward `currentPageId` and `translations` props

**File 3**: `components/pages/WordPressPageRenderer.tsx`

**Function**: `WordPressPageRenderer` (default export)

**Specific Changes**:
1. **Update Props Interface**: Add `currentPageId?: number` and `translations?: TranslationMap` to the component props
2. **Import Header**: Since templates render their own headers, we need to ensure translation data flows through
3. **Alternative Approach**: Use React Context or modify the layout to pass translation data to Header

**File 4**: `app/layout.tsx`

**Function**: Root layout component

**Specific Changes**:
1. **Accept Translation Props**: Modify layout to accept optional translation props from page components
2. **Pass to Header**: Forward `currentPageId` and `translations` to the Header component
3. **Note**: This requires careful handling of Next.js layout/page data flow

**File 5**: `components/Header.tsx`

**Function**: `Header` (default export)

**Specific Changes**:
1. **Update Props Interface**: Add `currentPageId?: number` and `translations?: TranslationMap` to the component props
2. **Pass to LanguageSwitcher**: Forward these props to the `LanguageSwitcher` component in the JSX
3. **Maintain Server Component**: Ensure Header remains a server component (no 'use client' directive)

**Note**: The actual implementation may require using React Context or a different approach to thread data through the layout, as Next.js layouts don't directly receive props from pages. An alternative is to make Header accept these props and have each template component render Header with the appropriate data.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by observing actual navigation behavior, then verify the fix works correctly and preserves existing behavior through automated tests.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that clicking the language switcher on non-homepage pages navigates to the homepage instead of the translated page.

**Test Plan**: Manually test the language switcher on various pages in both languages, observing the navigation behavior. Document the actual vs expected URLs. Then write automated tests that simulate these interactions on the UNFIXED code to observe failures.

**Test Cases**:
1. **Swedish to English Navigation**: Navigate to `/sv/virtual-server`, click "English" in switcher (will navigate to `/` instead of `/virtual-server` on unfixed code)
2. **English to Swedish Navigation**: Navigate to `/domains`, click "Svenska" in switcher (will navigate to `/sv` instead of `/sv/domaner` on unfixed code)
3. **About Page Translation**: Navigate to `/about-bluerange`, click "Svenska" in switcher (will navigate to `/sv` instead of `/sv/om-bluerange` on unfixed code)
4. **Missing Translation Fallback**: Navigate to a page with no translation, click language switcher (should navigate to homepage - this may already work on unfixed code)

**Expected Counterexamples**:
- Language switcher always navigates to homepage instead of translated page
- Console logs show `translations` prop is undefined in LanguageSwitcher component
- Possible causes: missing `getTranslations()` call, props not passed through component tree, layout/page data flow issue

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (clicking language switcher on non-homepage pages with translations), the fixed system produces the expected behavior (navigates to translated page).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleLanguageSwitch_fixed(input)
  ASSERT result.navigatedTo === expectedTranslatedUrl(input.currentPageId, input.targetLang)
  ASSERT result.navigatedTo !== homepageUrl(input.targetLang)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (homepage language switching, dropdown display, other interactions), the fixed system produces the same result as the original system.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT behavior_original(input) = behavior_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different pages, languages, interaction types)
- It catches edge cases that manual unit tests might miss (e.g., special characters in slugs, missing translations)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for homepage language switching and dropdown interactions, then write property-based tests capturing that behavior to ensure it continues after the fix.

**Test Cases**:
1. **Homepage Language Switching**: Observe that switching languages on `/` and `/sv` works correctly on unfixed code, then write test to verify this continues after fix
2. **Dropdown Display**: Observe that the language dropdown displays correctly with flags and active language highlighting on unfixed code, then write test to verify this continues after fix
3. **Fallback Behavior**: Observe that pages without translations fall back to homepage on unfixed code, then write test to verify this continues after fix
4. **Visual Styling**: Observe that language switcher styling and positioning remain unchanged after fix

### Unit Tests

- Test `getTranslations()` function returns correct TranslationMap for pages with translations
- Test `getTranslations()` function returns empty object for pages without translations
- Test LanguageSwitcher component receives and uses `currentPageId` and `translations` props correctly
- Test route handlers fetch and pass translation data to components
- Test Header component accepts and forwards translation props to LanguageSwitcher

### Property-Based Tests

- Generate random page IDs and language combinations, verify that `getTranslations()` returns valid TranslationMap or empty object
- Generate random navigation scenarios (different pages, languages), verify that language switcher navigates to correct URL when translations exist
- Generate random page states, verify that preservation behaviors (homepage switching, dropdown display, fallback) continue to work correctly

### Integration Tests

- Test full user flow: navigate to a page, click language switcher, verify navigation to translated page
- Test language switching across multiple pages in sequence (e.g., English page → Swedish page → English page)
- Test that visual feedback (dropdown open/close, active language highlighting) works correctly after fix
- Test edge cases: pages without translations, homepage language switching, direct URL navigation to translated pages
