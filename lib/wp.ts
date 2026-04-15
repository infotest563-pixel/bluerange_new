const WP = 'https://dev-bluerange.pantheonsite.io';

// TypeScript interfaces
export interface TranslationMap {
    [langCode: string]: {
        id: number;
        slug: string;
        href: string;
    };
}

export interface Language {
    code: string;
    name: string;
    url: string;
    flag: string;
    slug?: string;
}

export interface WordPressPage {
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

export const SUPPORTED_LANGUAGES = ['en', 'sv'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
    name: string;
    flag: string;
    homePath: string;
}> = {
    en: {
        name: 'English',
        flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAt1BMVEWSmb66z+18msdig8La3u+tYX9IaLc7W7BagbmcUW+kqMr/q6n+//+hsNv/lIr/jIGMnNLJyOP9/fyQttT/wb3/////aWn+YWF5kNT0oqz0i4ueqtIZNJjhvt/8gn//WVr/6+rN1+o9RKZwgcMPJpX/VFT9UEn+RUX8Ozv2Ly+FGzdYZrfU1e/8LS/lQkG/mbVUX60AE231hHtcdMb0mp3qYFTFwNu3w9prcqSURGNDaaIUMX5FNW5wYt7AAAAAjklEQVR4AR3HNUJEMQCGwf+L8RR36ajR+1+CEuvRdd8kK9MNAiRQNgJmVDAt1yM6kSzYVJUsPNssAk5N7ZFKjVNFAY4co6TAOI+kyQm+LFUEBEKKzuWUNB7rSH/rSnvOulOGk+QlXTBqMIrfYX4tSe2nP3iRa/KNK7uTmWJ5a9+erZ3d+18od4ytiZdvZyuKWy8o3UpTVAAAAABJRU5ErkJggg==',
        homePath: '/'
    },
    sv: {
        name: 'Svenska',
        flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAXVBMVEUAP4H9wAAAKnQAHmsAEF8AB1QAAEd7sct5r8r+5HX943BopcNcnr9Qlrf93VFBjbI2hq0rfqgAADf72UcieqT51jn40i72ziL0yxTmiwD00DQUcKEMaJsAABztngB+lbt6AAAAVklEQVR4AUXHBWEDQABD0fcPhgrmX+KYuW04QXRgzpUi8ZzzbfA5JB9zCDZpTlYNtgtJrQHb+Pv/6/SxqrczvU7nct8I8ve5XnrveXvzJqaW3HDHNfgCGFkLqHdB0OIAAAAASUVORK5CYII=',
        homePath: '/sv'
    }
};

export async function getSettings(lang: string = 'en') {
    const url = `${WP}/wp-json/headless/v1/site-settings?lang=${lang}`;
    const res = await fetch(url, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    } as RequestInit);

    if (!res.ok) {
        console.error(`[getSettings] Failed: ${res.status} ${res.statusText}`);
        return {};
    }

    const data = await res.json();
    return {
        show_on_front: data.show_on_front,
        page_on_front: Number(data.page_on_front),
        page_for_posts: Number(data.page_for_posts),
        options: data.options,
        footer_form_html: data.footer_form_html,
        custom_logo_url: data.custom_logo_url
    };
}

export async function getSite(lang: string = 'en') {
    const url = `${WP}/wp-json/headless/v1/site/?lang=${lang}`;

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 0 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        } as RequestInit);

        if (!res.ok) {
            return { name: 'Bluerange', description: '' };
        }

        return res.json();
    } catch (err) {
        console.error(`[getSite] Network Error:`, err);
        return { name: 'Bluerange', description: '' };
    }
}


export async function getPageById(id: number, lang: string = 'en') {
    return fetch(`${WP}/wp-json/wp/v2/pages/${id}?lang=${lang}&_embed&acf_format=standard`, { 
        cache: 'no-store',
        next: { revalidate: 0 } 
    } as RequestInit).then(r => r.json());
}

export async function getMedia(id: number) {
    return fetch(`${WP}/wp-json/wp/v2/media/${id}?lang=en`, { next: { revalidate: 3600 } } as RequestInit).then(r => r.json());
}

export async function getPage(slug: string, lang: string = 'en') {
    try {
        const res = await fetch(`${WP}/wp-json/wp/v2/pages?slug=${slug}&lang=${lang}&_embed&acf_format=standard`, { 
            cache: 'no-store',
            next: { revalidate: 0 } 
        } as RequestInit);
        
        if (!res.ok) {
            console.error(`[getPage] Failed: ${res.status} ${res.statusText}`);
            return null;
        }
        
        const data = await res.json();
        return data[0] || null;
    } catch (error) {
        console.error(`[getPage] Network error:`, error);
        return null;
    }
}

export async function getPageBySlug(slug: string, lang: string = 'en') {
    return getPage(slug, lang);
}

export async function getTranslations(pageId: number, lang: string = 'en'): Promise<TranslationMap> {
    try {
        const res = await fetch(`${WP}/wp-json/wp/v2/pages/${pageId}?lang=${lang}&_embed&acf_format=standard`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        } as RequestInit);

        if (!res.ok) {
            console.error(`[getTranslations] Failed: ${res.status} ${res.statusText}`);
            return {};
        }

        const data = await res.json();

        // Check if Polylang translation data exists
        if (!data.polylang_translations) {
            console.warn(`[getTranslations] No Polylang translation data found for page ${pageId}`);
            return {};
        }

        return data.polylang_translations;
    } catch (error) {
        console.error(`[getTranslations] Network error:`, error);
        return {};
    }
}

export async function getPostBySlug(slug: string, lang: string = 'en') {
    const res = await fetch(`${WP}/wp-json/wp/v2/posts?slug=${slug}&lang=${lang}&_embed&acf_format=standard`, { 
        cache: 'no-store',
        next: { revalidate: 0 } 
    } as RequestInit);
    const data = await res.json();
    return data[0] || null;
}

export async function getMenu(slug: string, lang: string = 'en') {
    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/menus/${slug}?lang=${lang}`, { 
            cache: 'no-store',
            next: { revalidate: 0 } 
        } as RequestInit);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

export async function renderShortcode(code: string) {
    if (!code) return '';

    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
            next: { revalidate: 60 }
        } as RequestInit);

        if (!res.ok) return '';

        const data = await res.json();

        if (typeof data === 'string') return data;
        if (data?.html) return data.html;
        if (data?.data) return data.data;

        return '';
    } catch (e) {
        console.error('[renderShortcode] Error:', e);
        return '';
    }
}

export interface Language {
    code: string;
    name: string;
    url: string;
    flag: string;
    slug?: string;
}

export async function getLanguages(): Promise<Language[]> {
    // Static fallback data
    const fallbackLanguages: Language[] = [
        { 
            code: 'sv', 
            name: 'Svenska', 
            url: 'https://bluerange.se', 
            flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAXVBMVEUAP4H9wAAAKnQAHmsAEF8AB1QAAEd7sct5r8r+5HX943BopcNcnr9Qlrf93VFBjbI2hq0rfqgAADf72UcieqT51jn40i72ziL0yxTmiwD00DQUcKEMaJsAABztngB+lbt6AAAAVklEQVR4AUXHBWEDQABD0fcPhgrmX+KYuW04QXRgzpUi8ZzzbfA5JB9zCDZpTlYNtgtJrQHb+Pv/6/SxqrczvU7nct8I8ve5XnrveXvzJqaW3HDHNfgCGFkLqHdB0OIAAAAASUVORK5CYII=' 
        },
        { 
            code: 'en', 
            name: 'English', 
            url: 'https://bluerange.se/en', 
            flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAt1BMVEWSmb66z+18msdig8La3u+tYX9IaLc7W7BagbmcUW+kqMr/q6n+//+hsNv/lIr/jIGMnNLJyOP9/fyQttT/wb3/////aWn+YWF5kNT0oqz0i4ueqtIZNJjhvt/8gn//WVr/6+rN1+o9RKZwgcMPJpX/VFT9UEn+RUX8Ozv2Ly+FGzdYZrfU1e/8LS/lQkG/mbVUX60AE231hHtcdMb0mp3qYFTFwNu3w9prcqSURGNDaaIUMX5FNW5wYt7AAAAAjklEQVR4AR3HNUJEMQCGwf+L8RR36ajR+1+CEuvRdd8kK9MNAiRQNgJmVDAt1yM6kSzYVJUsPNssAk5N7ZFKjVNFAY4co6TAOI+kyQm+LFUEBEKKzuWUNB7rSH/rSnvOulOGk+QlXTBqMIrfYX4tSe2nP3iRa/KNK7uTmWJ5a9+erZ3d+18od4ytiZdvZyuKWy8o3UpTVAAAAABJRU5ErkJggg==' 
        }
    ];

    try {
        const url = `${WP}/wp-json/polylang/v1/languages`;
        const res = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 0 }
        } as RequestInit);

        if (!res.ok) {
            console.warn(`[getLanguages] Polylang API returned ${res.status}, using fallback data`);
            return fallbackLanguages;
        }

        const data = await res.json();
        
        // Validate that we received an array
        if (!Array.isArray(data)) {
            console.warn(`[getLanguages] Polylang API returned non-array data, using fallback`);
            return fallbackLanguages;
        }

        // Map Polylang API response to our Language interface
        const languages: Language[] = data.map((lang: any) => ({
            code: lang.code || lang.slug || '',
            name: lang.name || '',
            url: lang.url || lang.home_url || '',
            flag: lang.flag || lang.flag_url || '',
            slug: lang.slug
        }));

        // Return fallback if no valid languages were returned
        if (languages.length === 0) {
            console.warn(`[getLanguages] No languages returned from Polylang API, using fallback`);
            return fallbackLanguages;
        }

        return languages;
    } catch (error) {
        console.error(`[getLanguages] Error fetching from Polylang API:`, error);
        return fallbackLanguages;
    }
}