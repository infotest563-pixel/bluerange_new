import { getSettings, getPageById } from '../lib/wp';
import DesignedHomepage from '../components/DesignedHomepage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  try {
    // Fetch English settings
    const settings = await getSettings('en');
    
    console.log('[Home] Settings:', settings);

    // Check if page_on_front is configured
    if (!settings?.page_on_front) {
      console.error('[Home] No page_on_front configured');
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Homepage Not Configured</h1>
          <p>WordPress Front Page is not configured.</p>
          <p>Please check WordPress Settings: Settings → Reading → Homepage</p>
        </div>
      );
    }

    // Fetch the homepage content
    const page = await getPageById(settings.page_on_front, 'en');
    
    console.log('[Home] Page:', page ? 'Found' : 'Not found');
    console.log('[Home] ACF:', page?.acf ? 'Present' : 'Missing');

    // Check if page exists
    if (!page) {
      console.error('[Home] Page not found for ID:', settings.page_on_front);
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Page Not Found</h1>
          <p>Homepage with ID {settings.page_on_front} could not be found.</p>
        </div>
      );
    }

    // Check if ACF data exists
    if (!page.acf) {
      console.warn('[Home] ACF data missing, rendering basic page');
      // Render basic page without ACF
      return (
        <main className="site-main" id="main">
          <article className="page">
            <header className="entry-header">
              <div className="container">
                <h1 dangerouslySetInnerHTML={{ __html: page.title?.rendered || 'Home' }} />
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
    console.error('[Home] Error:', error);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>An Error Occurred</h1>
        <p>Could not load the homepage. Please try again later.</p>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}