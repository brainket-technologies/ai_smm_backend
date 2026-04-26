import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1f2937', lineHeight: '1.5' }}>
      <Head>
        <title>SocialSuite - AI-Powered Social Media Management</title>
        <meta name="description" content="Manage your social media presence with SocialSuite AI." />
        <meta name="google-site-verification" content="frcj0zvfpIfP0axTUz7HXLFgBRXk_i3h-UH41MwJCk8" />
        <meta name="google-site-verification" content="6SUSLBkCh-VQFqkcmA3bsreeSzJnkGm15_eAYY9Pr-8" />
      </Head>

      {/* Header */}
      <header style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>SocialSuite</div>
        <nav>
          <a href="/privacy" style={{ marginLeft: '1.5rem', textDecoration: 'none', color: '#4b5563' }}>Privacy Policy</a>
          <a href="/terms" style={{ marginLeft: '1.5rem', textDecoration: 'none', color: '#4b5563' }}>Terms of Service</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#111827' }}>
          SocialSuite <span style={{ color: '#6366f1' }}>AI</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Connect your Google Business, Instagram, and Facebook profiles to SocialSuite. 
          Manage your presence and generate AI-powered content effortlessly.
        </p>
        <div style={{ padding: '3rem', backgroundColor: '#ffffff', borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>OAuth Verification Center</h3>
          <p style={{ color: '#6b7280' }}>
            SocialSuite uses Google OAuth to manage your Google Business Profiles. 
            We only access the data you explicitly approve.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🛡️</div>
              <p style={{ fontWeight: '600' }}>Secure</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>📄</div>
              <p style={{ fontWeight: '600' }}>Compliant</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>⚡</div>
              <p style={{ fontWeight: '600' }}>Fast</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem', backgroundColor: '#111827', color: '#9ca3af', textAlign: 'center' }}>
        <p>© 2026 SocialSuite. All rights reserved.</p>
        <div style={{ marginTop: '1rem' }}>
          <a href="/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <a href="/terms" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
