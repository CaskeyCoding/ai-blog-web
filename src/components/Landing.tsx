import React from 'react';
import { Link } from 'react-router-dom';

const apps = [
  {
    title: 'Eric Caskey',
    description: 'Portfolio & professional journey',
    path: '/ericcaskey',
    icon: '👤',
  },
  {
    title: 'Blog',
    description: 'Technical writing & insights',
    path: '/blog',
    icon: '✍️',
  },
  {
    title: 'Profile',
    description: 'Skills, certifications & details',
    path: '/profile',
    icon: '📋',
  },
];

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafbfc',
      padding: '2rem',
    }}>
      {/* Logo / Brand */}
      <div style={{ marginBottom: '1rem' }}>
        <img
          src="/caskeycoding.png"
          alt="CaskeyCoding"
          style={{ height: 48, opacity: 0.9 }}
        />
      </div>

      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#003366',
        margin: '0 0 0.25rem 0',
        letterSpacing: '-0.02em',
      }}>
        caskeycoding
      </h1>

      <p style={{
        fontSize: '0.9rem',
        color: '#64748b',
        margin: '0 0 3rem 0',
        fontWeight: 400,
      }}>
        Engineering at scale. Building in public.
      </p>

      {/* App Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        width: '100%',
        maxWidth: '680px',
      }}>
        {apps.map((app) => (
          <Link
            key={app.path}
            to={app.path}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#003366';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,51,102,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                {app.icon}
              </div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#003366',
                marginBottom: '0.25rem',
              }}>
                {app.title}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                fontWeight: 400,
              }}>
                {app.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Minimal footer */}
      <div style={{
        marginTop: '4rem',
        fontSize: '0.75rem',
        color: '#cbd5e1',
      }}>
        © {new Date().getFullYear()} Eric Caskey
      </div>
    </div>
  );
}
