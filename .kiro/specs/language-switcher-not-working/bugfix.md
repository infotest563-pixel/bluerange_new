# Bugfix Requirements Document

## Introduction

The language switcher component in the header is not functioning when clicked. While the UI component exists and displays correctly with a dropdown showing English and Swedish options, clicking on a language option does not navigate to the translated version of the current page. The root cause is that the `LanguageSwitcher` component requires `currentPageId` and `translations` props to perform language switching with proper slug mapping, but these props are never being passed from the page route handlers through the component tree to the language switcher.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks on a language option in the language switcher dropdown THEN the system does not navigate to the translated page because the `translations` prop is undefined

1.2 WHEN the `LanguageSwitcher` component is rendered in the Header THEN the system does not receive `currentPageId` or `translations` props, causing the `handleLanguageSwitch` function to always fall back to homepage navigation

1.3 WHEN a page is rendered via `/app/[lang]/[slug]/page.tsx` THEN the system does not call `getTranslations(page.id, lang)` to fetch translation metadata from Polylang

1.4 WHEN the `Header` component is rendered THEN the system does not accept or pass translation data to the `LanguageSwitcher` component

### Expected Behavior (Correct)

2.1 WHEN a user clicks on a language option in the language switcher dropdown THEN the system SHALL navigate to the translated version of the current page using the translated slug from Polylang metadata

2.2 WHEN the `LanguageSwitcher` component is rendered in the Header THEN the system SHALL receive `currentPageId` and `translations` props containing the translation map for the current page

2.3 WHEN a page is rendered via `/app/[lang]/[slug]/page.tsx` THEN the system SHALL call `getTranslations(page.id, lang)` to fetch translation metadata and pass it to the page renderer

2.4 WHEN the `Header` component is rendered THEN the system SHALL accept translation props (`currentPageId` and `translations`) and pass them to the `LanguageSwitcher` component

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the language switcher dropdown is opened THEN the system SHALL CONTINUE TO display the list of available languages with flag icons

3.2 WHEN no translation exists for the target language THEN the system SHALL CONTINUE TO fall back to the homepage of the target language

3.3 WHEN the current language is displayed in the dropdown THEN the system SHALL CONTINUE TO visually indicate it as the active language with highlighting

3.4 WHEN a user is on the homepage THEN the system SHALL CONTINUE TO display the language switcher and allow switching between English and Swedish homepages

3.5 WHEN the Header component fetches languages via `getLanguages()` THEN the system SHALL CONTINUE TO display the correct language options in the switcher
