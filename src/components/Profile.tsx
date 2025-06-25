import React from 'react';
import { Container, Typography, Box, Paper, Chip, Stack, Avatar } from '@mui/material';

const palette = {
  primary: '#003366',
  accent: '#F5A623',
  background: '#f7f9fb',
  text: '#222',
};

const portraitUrl = '/EricCaskey_TechnologyLeader.jpg';

const skills = [
  'Cloud Architecture',
  'AI/ML Integration',
  'API Design',
  'Automation',
  'Site Reliability Engineering',
  'Mentorship',
  'Security',
  'DevOps',
  'Executive Communication',
];

const values = [
  'Integrity',
  'Innovation',
  'Empowerment',
  'Service',
  'Continuous Learning',
];

export default function Profile() {
  return (
    <Box sx={{ background: palette.background, minHeight: '100vh', fontFamily: 'sans-serif', py: 6 }}>
      <Container maxWidth="md">
        <Box className="hero-section" sx={{ mb: 8, p: 4, borderRadius: 4, position: 'relative' }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4}>
            <Box 
              sx={{ 
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: `4px solid ${palette.primary}`,
                backgroundImage: `url(${portraitUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 15%',
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} 
            />
            <Box flex={1}>
              <Typography variant="h3" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
                About Eric
              </Typography>
            </Box>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Executive Summary
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 4, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            Eric Caskey is a senior technology leader and innovator, currently shaping the future of monitoring at Amazon. With a proven track record of architecting scalable, AI-driven solutions, Eric empowers teams to deliver business value through automation, reliability, and a relentless focus on customer outcomes. His leadership philosophy centers on mentorship, integrity, and building systems that scale—both technically and organizationally.
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Mission
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 4, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            To empower organizations and individuals to achieve more through technology—by building resilient systems, fostering innovation, and leading with empathy and vision.
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Core Values
          </Typography>
          <Stack direction="row" spacing={1} mb={4} flexWrap="wrap" useFlexGap>
            {values.map((value) => (
              <Chip 
                key={value} 
                label={value} 
                sx={{ 
                  background: palette.primary, 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: { xs: 14, md: 16 }, 
                  mb: 1,
                  '&:hover': {
                    background: palette.accent,
                    color: palette.primary
                  }
                }} 
              />
            ))}
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Key Skills
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {skills.map((skill) => (
              <Chip 
                key={skill} 
                label={skill} 
                sx={{ 
                  background: palette.accent, 
                  color: palette.primary, 
                  fontWeight: 600, 
                  fontSize: { xs: 14, md: 16 }, 
                  mb: 1,
                  '&:hover': {
                    background: palette.primary,
                    color: '#fff'
                  }
                }} 
              />
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
} 