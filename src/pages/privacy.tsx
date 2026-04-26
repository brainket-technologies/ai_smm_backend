import React from 'react';
import Head from 'next/head';

export default function Privacy() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#374151', maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Head>
        <title>Privacy Policy - SocialSuite</title>
      </Head>
      <a href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>← Back to Home</a>
      <h1 style={{ fontSize: '2.5rem', color: '#111827', marginTop: '2rem' }}>Privacy Policy</h1>
      <p>Last updated: April 26, 2026</p>
      
      <section style={{ marginTop: '2.5rem' }}>
        <h2>1. Introduction</h2>
        <p>SocialSuite ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy informs you about how we handle your data when you connect your social media accounts through our application.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>2. Data We Collect</h2>
        <p>When you use SocialSuite, we may collect:</p>
        <ul>
          <li>Basic profile information (name, email, profile picture)</li>
          <li>Social media access tokens (encrypted and stored securely)</li>
          <li>Business profile details (from Google Business, Facebook, etc.)</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>3. Google User Data Policy</h2>
        <p>SocialSuite's use and transfer to any other app of information received from Google APIs will adhere to 
          <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" style={{ color: '#6366f1' }}> Google API Service User Data Policy</a>, 
          including the Limited Use requirements.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>4. Data Deletion</h2>
        <p>You can disconnect your accounts and request data deletion at any time through the SocialSuite mobile application settings or by contacting our support.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@socialsuite.ai</p>
      </section>
    </div>
  );
}
