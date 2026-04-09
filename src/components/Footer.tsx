import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';

const palette = {
  primary: '#003366',
  accent: '#F5A623',
  background: '#f7f9fb',
  text: '#222',
};

const linkedInUrl = 'https://www.linkedin.com/in/ericrcaskey';
const caskeyLogoUrl = '/caskeycoding.png';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 1,
        px: 2,
        mt: 'auto',
        background: palette.background,
        borderTop: `1px solid ${palette.primary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        minHeight: 40,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <img src={caskeyLogoUrl} alt="CaskeyCoding Logo" style={{ height: 22, marginRight: 6 }} />
        <Typography variant="caption" sx={{ color: palette.primary, fontWeight: 500 }}>
          © {new Date().getFullYear()} Eric Caskey
        </Typography>
      </Box>
      <MuiLink
        href={linkedInUrl}
        target="_blank"
        rel="noopener"
        underline="hover"
        sx={{ color: palette.primary, fontWeight: 500, fontSize: 14 }}
      >
        LinkedIn
      </MuiLink>
    </Box>
  );
} 