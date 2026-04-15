'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  url: string;
  flag: string;
  slug?: string;
}

interface LanguageSwitcherProps {
  languages: Language[];
}

export default function LanguageSwitcher({ languages }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Detect current language from pathname or default to 'en'
  const currentLangCode = pathname?.startsWith('/sv') ? 'sv' : 'en';
  const current = languages.find(lang => lang.code === currentLangCode) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
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
  }, [open]);

  const handleLanguageSwitch = (e: React.MouseEvent<HTMLAnchorElement>, langCode: string) => {
    e.preventDefault();
    setOpen(false);
    
    // Switch language on localhost
    if (langCode === 'sv') {
      router.push('/sv');
    } else {
      router.push('/');
    }
  };

  if (!languages || languages.length === 0) {
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
          {languages.map((lang, index) => (
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
                color: '#333',
                fontSize: '14px',
                borderBottom: index < languages.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: lang.code === currentLangCode ? '#f5f5f5' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => {
                if (lang.code !== currentLangCode) {
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
          ))}
        </div>
      )}
    </div>
  );
}
