import { getSettings, getPageById } from '../../lib/wp';
import DesignedHomepage from '../../components/DesignedHomepage';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SwedishHome() {
  try {
    // Fetch Swedish settings
    const settings = await getSettings('sv');
    
    console.log('[SwedishHome] Settings:', settings);

    // Check if page_on_front is configured
    if (!settings?.page_on_front) {
      console.error('[SwedishHome] No page_on_front configured for Swedish');
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Svensk hemsida inte konfigurerad</h1>
          <p>WordPress Front Page är inte konfigurerad för svenska.</p>
          <p>Kontrollera WordPress inställningar: Inställningar → Läsning → Hemsida</p>
        </div>
      );
    }

    // Fetch the homepage content
    const page = await getPageById(settings.page_on_front, 'sv');
    
    console.log('[SwedishHome] Page:', page ? 'Found' : 'Not found');
    console.log('[SwedishHome] ACF:', page?.acf ? 'Present' : 'Missing');

    // Check if page exists
    if (!page) {
      console.error('[SwedishHome] Page not found for ID:', settings.page_on_front);
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Sidan hittades inte</h1>
          <p>Hemsidan med ID {settings.page_on_front} kunde inte hittas.</p>
        </div>
      );
    }

    // Check if ACF data exists
    if (!page.acf) {
      console.warn('[SwedishHome] ACF data missing, rendering basic page');
      // Render basic page without ACF
      return (
        <main className="site-main" id="main">
          <article className="page">
            <header className="entry-header">
              <div className="container">
                <h1 dangerouslySetInnerHTML={{ __html: page.title?.rendered || 'Hem' }} />
              </div>
            </header>
            <div className="entry-content">
              <div className="container">
                <div dangerouslySetInnerHTML={{ __html: page.content?.rendered || '' }} />
              </div>
            </div>
          </article>
        </main>
      );
    }

    // Render with DesignedHomepage component
    return <DesignedHomepage page={page} />;
    
  } catch (error) {
    console.error('[SwedishHome] Error:', error);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Ett fel uppstod</h1>
        <p>Kunde inte ladda hemsidan. Försök igen senare.</p>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
