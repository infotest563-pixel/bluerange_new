import Link from 'next/link';

// Force dynamic rendering for 404 page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '60vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '20px 0', color: '#666' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link 
          href="/" 
          style={{
            padding: '12px 24px',
            background: '#0066cc',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          Go to English Homepage
        </Link>
        <Link 
          href="/sv" 
          style={{
            padding: '12px 24px',
            background: '#0066cc',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          Gå till svensk hemsida
        </Link>
      </div>
    </div>
  );
}
