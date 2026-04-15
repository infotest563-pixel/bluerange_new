import { getPage, getSettings, SUPPORTED_LANGUAGES } from '../../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../../components/pages/WordPressPageRenderer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageParams {
  lang: string;
  slug: string;
}

/**
 * Dynamic language-specific page route handler
 * Handles URLs like /sv/om-oss or /en/about-us
 * 
 * @param params - Route parameters containing language code and page slug
 * @returns Rendered page component or 404/redirect
 */
export default async function LanguagePage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  const { lang, slug } = await params;
  
  // Validate language code against supported languages ['en', 'sv']
  if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
    notFound();
  }
  
  // Fetch page content with language parameter from WordPress API
  // Uses Polylang's ?lang parameter to get the correct translation
  const page = await getPage(slug, lang);
  
  // Return 404 for missing page
  if (!page) {
    notFound();
  }
  
  // Prevent homepage redirect loops by checking page_on_front setting
  // If this page is the homepage, redirect to the appropriate root URL
  const settings = await getSettings(lang);
  if (page.id === settings.page_on_front) {
    redirect(lang === 'en' ? '/' : `/${lang}`);
  }
  
  // Render page using WordPressPageRenderer component
  // The renderer will route to the appropriate template based on slug
  return <WordPressPageRenderer page={page} />;
}

/**
 * Generate static params for known pages (optional optimization)
 * Uncomment and customize if you want to pre-render specific pages
 */
// export async function generateStaticParams() {
//   const pages = [
//     { lang: 'en', slug: 's3-storage' },
//     { lang: 'sv', slug: 's3-lagring' },
//     // Add more pages here
//   ];
//   return pages;
// }
