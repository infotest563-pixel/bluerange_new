import { getPage, getSettings, SUPPORTED_LANGUAGES } from '../../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../../components/pages/WordPressPageRenderer';

interface PageParams {
  lang: string;
  slug: string;
}

export default async function LanguagePage({ 
  params 
}: { 
  params: Promise<PageParams> 
}) {
  const { lang, slug } = await params;
  
  // Validate language code against supported languages
  if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
    notFound();
  }
  
  // Fetch page content with language parameter
  const page = await getPage(slug, lang);
  
  // Return 404 for missing page
  if (!page) {
    notFound();
  }
  
  // Prevent homepage redirect loops by checking page_on_front setting
  const settings = await getSettings(lang);
  if (page.id === settings.page_on_front) {
    redirect(lang === 'en' ? '/' : `/${lang}`);
  }
  
  // Render page using WordPressPageRenderer component
  return <WordPressPageRenderer page={page} />;
}
