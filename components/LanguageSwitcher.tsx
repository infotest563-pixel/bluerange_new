'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

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

interface LanguageSwitcherProps {
  languages: Language[];
  currentPageId?: number;
  translations?: TranslationMap;
}

export default function LanguageSwitcher({ languages, currentPageId, translations }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [fetchedTranslations, setFetchedTranslations] = useState<TranslationMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Detect current language and slug from pathname
  const currentLangCode = pathname?.startsWith('/sv') ? 'sv' : 'en';
  const current = languages.find(lang => lang.code === currentLangCode) || languages[0];
  
  // Extract slug from pathname
  const getSlugFromPathname = useCallback(() => {
    if (!pathname) return null;
    
    // Handle root paths (homepages)
    if (pathname === '/' || pathname === '/sv') return null;
    
    // Handle /[lang]/[slug] pattern
    const langMatch = pathname.match(/^\/(en|sv)\/([^/]+)/);
    if (langMatch) return langMatch[2];
    
    // Handle /[slug] pattern (English pages without lang prefix)
    const slugMatch = pathname.match(/^\/([^/]+)/);
    if (slugMatch) return slugMatch[1];
    
    return null;
  }, [pathname]);
  
  const currentSlug = getSlugFromPathname();

  // Fetch translations when slug is available and translations not provided
  useEffect(() => {
    if (!isMounted) return;
    
    const fetchTranslations = async () => {
      if (currentSlug && !translations && !fetchedTranslations && !isLoading) {
        setIsLoading(true);
        try {
          // Fetch page by slug to get its ID and translations
          const res = await fetch(
            `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=${currentSlug}&lang=${currentLangCode}&_fields=id,polylang_translations`,
            { cache: 'no-store' }
          );
          
          if (res.ok) {
            const data = await res.json();
            if (data && data[0] && data[0].polylang_translations) {
              setFetchedTranslations(data[0].polylang_translations);
            }
          }
        } catch (error) {
          console.error('[LanguageSwitcher] Failed to fetch translations:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchTranslations();
  }, [currentSlug, currentLangCode, translations, fetchedTranslations, isLoading, isMounted]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isMounted) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-switcher')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open, isMounted]);

  const handleLanguageSwitch = useCallback((e: React.MouseEvent<HTMLAnchorElement>, langCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    
    // Use provided translations or fetched translations
    const activeTranslations = translations || fetchedTranslations;
    
    // Build the target URL
    let targetUrl: string;
    
    // Check if translation exists in target language
    if (activeTranslations && activeTranslations[langCode]) {
      const translatedSlug = activeTranslations[langCode].slug;
      
      // Navigate to translated slug
      // English uses /[slug] pattern, other languages use /[lang]/[slug]
      if (langCode === 'en') {
        targetUrl = `/${translatedSlug}`;
      } else {
        targetUrl = `/${langCode}/${translatedSlug}`;
      }
    } else {
      // Fall back to homepage if translation unavailable
      targetUrl = langCode === 'en' ? '/' : `/${langCode}`;
    }
    
    // Use window.location for more reliable navigation on Vercel
    // This ensures the page fully reloads with the new language
    window.location.href = targetUrl;
  }, [translations, fetchedTranslations]);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !languages || languages.length === 0) {
    return null;
  }

  return (
    <div className="lang-switcher" style={{ position: 'relative', marginLeft: '12px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
        }}
        aria-label="Switch language"
      >
        <img 
          src={current.flag} 
          alt={current.name} 
          width={16} 
          height={11} 
          style={{ width: '16px', height: '11px' }} 
        />
        <span style={{ fontSize: '12px', color: '#fff' }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '140px',
            marginTop: '4px',
          }}
        >
          {languages.map((lang, index) => {
            const isActive = lang.code === currentLangCode;
            return (
              <a
                key={lang.code}
                href="#"
                onClick={(e) => handleLanguageSwitch(e, lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  textDecoration: 'none',
                  color: isActive ? '#0066cc' : '#333',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  borderBottom: index < languages.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: isActive ? '#e6f2ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #0066cc' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <img 
                  src={lang.flag} 
                  alt={lang.name} 
                  width={16} 
                  height={11} 
                  style={{ width: '16px', height: '11px' }} 
                />
                {lang.name}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
