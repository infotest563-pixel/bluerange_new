'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  resolvedUrl: string;
  classes?: string[];
  children?: Array<{
    id: number;
    title: string;
    url: string;
    resolvedUrl: string;
  }>;
}

interface NavigationProps {
  menuItems: MenuItem[];
}

export default function Navigation({ menuItems }: NavigationProps) {
  useEffect(() => {
    // Initialize Bootstrap dropdowns after component mounts
    if (typeof window !== 'undefined' && (window as any).$ && (window as any).$.fn.dropdown) {
      (window as any).$('.dropdown-toggle').dropdown();
      
      // Enable hover for desktop
      if (window.innerWidth >= 768) {
        (window as any).$('.navbar-nav .dropdown').hover(
          function(this: HTMLElement) {
            (window as any).$(this).find('.dropdown-menu').stop(true, true).fadeIn(200);
          },
          function(this: HTMLElement) {
            (window as any).$(this).find('.dropdown-menu').stop(true, true).fadeOut(200);
          }
        );
      }
    }
  }, []);

  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return null;
  }

  return (
    <ul className="navbar-nav ml-auto" id="main-menu">
      {menuItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const liClasses = ['nav-item'];

        if (item.classes && Array.isArray(item.classes)) {
          liClasses.push(...item.classes);
        }

        if (hasChildren) liClasses.push('dropdown');

        return (
          <li key={item.id} className={liClasses.join(' ')}>
            {hasChildren ? (
              <>
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  id={`dropdown-target-${item.id}`}
                  role="button"
                  onClick={(e) => e.preventDefault()}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.title }} />
                </a>
                <div className="dropdown-menu" aria-labelledby={`dropdown-target-${item.id}`}>
                  {item.children?.map((child) => (
                    <Link key={child.id} href={child.resolvedUrl} className="dropdown-item">
                      <span dangerouslySetInnerHTML={{ __html: child.title }} />
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link href={item.resolvedUrl} className="nav-link">
                <span dangerouslySetInnerHTML={{ __html: item.title }} />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
