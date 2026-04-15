import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import { getMenu, getSite, getSettings, getLanguages } from '../lib/wp';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function Header() {
    let siteData: any = {};
    let settings: any = {};
    let languages: any[] = [];
    let menuItems: any[] = [];

    // Wrap all API calls in try-catch to prevent page crashes
    try {
        siteData = await getSite();
    } catch (error) {
        console.error('[Header] Failed to fetch site data:', error);
    }

    try {
        settings = await getSettings();
    } catch (error) {
        console.error('[Header] Failed to fetch settings:', error);
    }

    try {
        languages = await getLanguages();
    } catch (error) {
        console.error('[Header] Failed to fetch languages:', error);
        // Fallback to default languages
        languages = [
            {
                code: 'en',
                name: 'English',
                url: '/',
                flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFzSURBVHjaYvzPgAD/UNlYEUAAmuTYAAAAAElFTkSuQmCC'
            },
            {
                code: 'sv',
                name: 'Svenska',
                url: '/sv',
                flag: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFXSURBVHjaYvzPgAD/UNlYEUAAmuTYAAAAAElFTkSuQmCC'
            }
        ];
    }

    try {
        menuItems = await getMenu('primary');
        
        // Fetch Menu with Fallbacks
        if (!menuItems || menuItems.length === 0) {
            menuItems = await getMenu('primary-menu');
        }
        if (!menuItems || menuItems.length === 0) {
            menuItems = await getMenu('main-menu');
        }
    } catch (error) {
        console.error('[Header] Failed to fetch menu:', error);
        menuItems = [];
    }

    let logoUrl: string | null = null;

    // 2. Try Site Settings (Legacy Endpoint)
    if (!logoUrl && settings?.custom_logo_url) {
        logoUrl = settings.custom_logo_url;
    }

    // 3. Try Site Data (Customizer - Fallback, might contain flags)
    if (!logoUrl && siteData?.logo) {
        const potentialLogo = typeof siteData.logo === 'string' ? siteData.logo : siteData.logo.url;
        // Avoid base64 flags
        if (potentialLogo && !potentialLogo.startsWith('data:image')) {
            logoUrl = potentialLogo;
        }
    }

    // Fallback URL resolver
    const resolveUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith(WP_HOST)) {
            return url.replace(WP_HOST, '') || '/';
        }
        return url;
    };

    // Pre-resolve URLs for menu items
    const resolvedMenuItems = menuItems.map((item: any) => ({
        ...item,
        resolvedUrl: resolveUrl(item.url),
        children: item.children?.map((child: any) => ({
            ...child,
            resolvedUrl: resolveUrl(child.url)
        }))
    }));

    return (
        <div suppressHydrationWarning>
            <div className="top-header">
                <div className="container">
                    <div className="row">
                        <div className="col col-12">
                            <div className="wd-100 tophead-ul">
                                <ul>
                                    <li>
                                        <a href="tel:036345900">
                                            <img src={`${WP_HOST}/wp-content/uploads/2023/09/telephone-fill.svg`} className="img-fluid" alt="" />
                                            <span>036-34 59 00</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:Support@bluerange.se">
                                            <img src={`${WP_HOST}/wp-content/uploads/2023/09/envelope-fill.svg`} className="img-fluid" alt="" />
                                            <span>Support@bluerange.se</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <header id="wrapper-navbar">
                <a className="skip-link screen-reader-text sr-only" href="#content">
                    Skip to content
                </a>

                <nav id="main-nav" className="navbar navbar-expand-md navbar-dark bg-primary" aria-labelledby="main-nav-label">
                    <h2 id="main-nav-label" className="screen-reader-text sr-only">
                        Main Navigation
                    </h2>

                    <div className="container">
                        <Link href="/" className="navbar-brand custom-logo-link" rel="home">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    className="custom-logo"
                                    alt={siteData?.name || 'Bluerange'}
                                    width={200}
                                    height={50}
                                    style={{ width: 'auto', height: 'auto', maxHeight: '50px' }}
                                />
                            ) : (
                                <span>{siteData?.name || 'Bluerange'}</span>
                            )}
                        </Link>

                        <button
                            className="navbar-toggler"
                            type="button"
                            data-toggle="collapse"
                            data-target="#navbarNavDropdown"
                            aria-controls="navbarNavDropdown"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <Navigation menuItems={resolvedMenuItems} />
                        </div>

                        <LanguageSwitcher languages={languages} />

                        <MobileMenu menuItems={resolvedMenuItems} />

                    </div>
                </nav>
            </header>
        </div>
    );
}
