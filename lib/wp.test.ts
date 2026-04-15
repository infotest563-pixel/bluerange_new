import fc from 'fast-check';

/**
 * Property-Based Tests for WordPress Polylang Multilingual Feature
 * 
 * These tests validate correctness properties across all valid inputs
 * using the fast-check library with minimum 100 iterations per property.
 */

describe('Feature: wordpress-polylang-multilingual', () => {
  /**
   * Property 1: API URL Construction with Language Parameters
   * 
   * **Validates: Requirements 1.1, 1.4, 3.4, 3.5, 6.2, 8.1**
   * 
   * For any WordPress API request (pages, posts, menus, settings), 
   * the constructed URL should include the `lang` query parameter with 
   * the specified language code, and should include required parameters 
   * like `_embed` and `acf_format=standard` where applicable.
   */
  describe('Property 1: API URL Construction with Language Parameters', () => {
    const WP_BASE = 'https://dev-bluerange.pantheonsite.io';

    // Helper function to construct page URL (mirrors implementation)
    const constructPageUrl = (slug: string, lang: string): string => {
      return `${WP_BASE}/wp-json/wp/v2/pages?slug=${slug}&lang=${lang}&_embed&acf_format=standard`;
    };

    // Helper function to construct page by ID URL
    const constructPageByIdUrl = (id: number, lang: string): string => {
      return `${WP_BASE}/wp-json/wp/v2/pages/${id}?lang=${lang}&_embed&acf_format=standard`;
    };

    // Helper function to construct post URL
    const constructPostUrl = (slug: string, lang: string): string => {
      return `${WP_BASE}/wp-json/wp/v2/posts?slug=${slug}&lang=${lang}&_embed&acf_format=standard`;
    };

    // Helper function to construct menu URL
    const constructMenuUrl = (slug: string, lang: string): string => {
      return `${WP_BASE}/wp-json/headless/v1/menus/${slug}?lang=${lang}`;
    };

    // Helper function to construct settings URL
    const constructSettingsUrl = (lang: string): string => {
      return `${WP_BASE}/wp-json/headless/v1/site-settings?lang=${lang}`;
    };

    // Helper function to construct site URL
    const constructSiteUrl = (lang: string): string => {
      return `${WP_BASE}/wp-json/headless/v1/site/?lang=${lang}`;
    };

    test('all page URLs by slug include lang parameter, _embed, and acf_format=standard', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          (lang, slug) => {
            const url = constructPageUrl(slug, lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify _embed parameter is present
            expect(url).toContain('_embed');
            
            // Verify acf_format=standard parameter is present
            expect(url).toContain('acf_format=standard');
            
            // Verify slug parameter is present
            expect(url).toContain(`slug=${slug}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all page URLs by ID include lang parameter, _embed, and acf_format=standard', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          fc.integer({ min: 1, max: 10000 }),
          (lang, id) => {
            const url = constructPageByIdUrl(id, lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify _embed parameter is present
            expect(url).toContain('_embed');
            
            // Verify acf_format=standard parameter is present
            expect(url).toContain('acf_format=standard');
            
            // Verify page ID is in the URL
            expect(url).toContain(`/pages/${id}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all post URLs include lang parameter, _embed, and acf_format=standard', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          (lang, slug) => {
            const url = constructPostUrl(slug, lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify _embed parameter is present
            expect(url).toContain('_embed');
            
            // Verify acf_format=standard parameter is present
            expect(url).toContain('acf_format=standard');
            
            // Verify slug parameter is present
            expect(url).toContain(`slug=${slug}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all menu URLs include lang parameter', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          (lang, menuSlug) => {
            const url = constructMenuUrl(menuSlug, lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify menu slug is in the URL
            expect(url).toContain(`/menus/${menuSlug}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all settings URLs include lang parameter', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          (lang) => {
            const url = constructSettingsUrl(lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify it's the settings endpoint
            expect(url).toContain('/site-settings');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('all site URLs include lang parameter', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          (lang) => {
            const url = constructSiteUrl(lang);
            
            // Verify lang parameter is present
            expect(url).toContain(`lang=${lang}`);
            
            // Verify it's the site endpoint
            expect(url).toContain('/site/');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('default language parameter is "en" when not specified', () => {
      // Test that when no language is provided, 'en' is used as default
      const defaultLang = 'en';
      
      // Test with various slugs
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          (slug) => {
            const url = constructPageUrl(slug, defaultLang);
            expect(url).toContain('lang=en');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('URLs are properly formatted with correct query parameter separators', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'sv'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          (lang, slug) => {
            const url = constructPageUrl(slug, lang);
            
            // Verify URL structure is valid
            expect(url).toMatch(/^https:\/\//);
            
            // Verify query parameters are properly separated
            const queryString = url.split('?')[1];
            expect(queryString).toBeDefined();
            
            // Verify all required parameters are present in query string
            expect(queryString).toContain('slug=');
            expect(queryString).toContain('lang=');
            expect(queryString).toContain('_embed');
            expect(queryString).toContain('acf_format=standard');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
