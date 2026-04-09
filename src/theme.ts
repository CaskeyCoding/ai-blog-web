import { createTheme } from '@mui/material/styles';

export const palette = {
  primary: '#003366',
  accent: '#F5A623',
  text: '#222222',
  textSecondary: '#64748b',
  background: '#f7f9fb',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  error: '#d32f2f',
};

const theme = createTheme({
  palette: {
    primary: { main: palette.primary },
    secondary: { main: palette.accent },
    error: { main: palette.error },
    background: { default: palette.background, paper: palette.surface },
    text: { primary: palette.text, secondary: palette.textSecondary },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    h1: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h2: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    button: {
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 500,
      textTransform: 'none' as const,
    },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    caption: { lineHeight: 1.5 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
