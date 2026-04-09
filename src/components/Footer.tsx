import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { palette } from '../theme';

const linkedInUrl = 'https://www.linkedin.com/in/ericrcaskey';
const caskeyLogoUrl = '/caskeycoding.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Experience', to: '/ericcaskey' },
  { label: 'Blog', to: '/blog' },
  { label: 'Profile', to: '/profile' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 2,
        px: 3,
        mt: 'auto',
        background: palette.background,
        borderTop: `1px solid ${palette.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        boxSizing: 'border-box',
      }}
    >
      <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
        {navLinks.map(({ label, to }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <Typography variant="caption" sx={{
              color: palette.primary,
              fontWeight: 500,
              '&:hover': { color: palette.accent },
              transition: 'color 0.2s ease',
            }}>
              {label}
            </Typography>
          </Link>
        ))}
        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <Typography variant="caption" sx={{
            color: palette.primary,
            fontWeight: 500,
            '&:hover': { color: palette.accent },
            transition: 'color 0.2s ease',
          }}>
            LinkedIn
          </Typography>
        </a>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <img src={caskeyLogoUrl} alt="CaskeyCoding Logo" style={{ height: 18 }} />
        <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 400 }}>
          © {new Date().getFullYear()} Eric Caskey
        </Typography>
      </Box>
    </Box>
  );
}
