'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface MenuItem {
  id: number;
  title: string;
  resolvedUrl: string;
  children?: Array<{
    id: number;
    title: string;
    resolvedUrl: string;
  }>;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

export default function MobileMenu({ menuItems }: MobileMenuProps) {
  useEffect(() => {
    // Initialize mobile menu functionality
    const deskShow = document.querySelector('.desk-show');
    const deskClose = document.querySelector('.desk-close');
    const desksideInner = document.querySelector('.deskside-inner');

    const openMenu = () => {
      desksideInner?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      desksideInner?.classList.remove('active');
      document.body.style.overflow = '';
    };

    deskShow?.addEventListener('click', openMenu);
    deskClose?.addEventListener('click', closeMenu);

    // Cleanup
    return () => {
      deskShow?.removeEventListener('click', openMenu);
      deskClose?.removeEventListener('click', closeMenu);
    };
  }, []);

  return (
    <div className="desk-toggale">
      <span className="desk-show">
        <i className="fa fa-bars" aria-hidden="true"></i>
      </span>
      <div className="deskside-inner">
        <span className="desk-close">
          <i className="fa fa-window-close" aria-hidden="true"></i>
        </span>
        <div className="deskside-content">
          <ul className="mobile-menu-list">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link href={item.resolvedUrl}>
                  <span dangerouslySetInnerHTML={{ __html: item.title }} />
                </Link>
                {item.children && item.children.length > 0 && (
                  <ul className="submenu">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link href={child.resolvedUrl}>
                          <span dangerouslySetInnerHTML={{ __html: child.title }} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

