import React from 'react';
import Head from 'next/head';

export default function Terms() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#374151', maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Head>
        <title>Terms of Service - SocialSuite</title>
      </Head>
      <a href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>← Back to Home</a>
      <h1 style={{ fontSize: '2.5rem', color: '#111827', marginTop: '2rem' }}>Terms of Service</h1>
      <p>Last updated: April 26, 2026</p>
      
      <section style={{ marginTop: '2.5rem' }}>
        <h2>1. Agreement to Terms</h2>
        <p>By using SocialSuite, you agree to be bound by these Terms of Service. If you do not agree, do not use the application.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>2. Use of Services</h2>
        <p>You agree to use SocialSuite only for lawful purposes and in accordance with the terms of the social media platforms you connect (Google, Meta, LinkedIn, etc.).</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>3. Limitation of Liability</h2>
        <p>SocialSuite shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the application or integration with social media platforms.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>4. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Your continued use of the app constitutes acceptance of new terms.</p>
      </section>
    </div>
  );
}
