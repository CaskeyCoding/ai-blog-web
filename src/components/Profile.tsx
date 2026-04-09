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
  'Distributed Systems',
  'Workflow Orchestration',
  'Enterprise Platform Architecture',
  'Observability & Monitoring',
  'Multi-Region Platform Architecture',
  'API Design',
  'Python',
  'Java',
  'AWS',
  'CDK',
  'Smithy',
  'GenAI / AI Integration',
  'Saga Pattern',
  'Control Plane / Data Plane',
  'Cloud Automation',
  'Spec-Driven Development',
  'Mentorship & Leadership',
  'Agile Practices',
];

const values = [
  'Integrity',
  'Innovation',
  'Empowerment',
  'Service',
  'Continuous Learning',
];

const leadershipBullets = [
  'Architect enterprise-scale platforms used across engineering organizations',
  'Design change-safety guardrails with pre/post checks and automated rollback',
  'Build microservice systems that reconcile API, S3, and SNS infrastructure signals',
  'Drive platform standards adopted by product engineers and backend automation',
  'Scale reliability practices from org standard toward enterprise-wide adoption',
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
              <Typography variant="h3" sx={{ color: palette.primary, fontWeight: 700, mb: 1 }}>
                About Eric
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
                Enterprise Platform Engineering at Scale
              </Typography>
            </Box>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Executive Summary
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 3, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            Eric operates at the intersection of enterprise software architecture, infrastructure strategy, and engineering culture. With 15+ years of experience, he builds platforms and change-safety systems that keep large-scale infrastructure current, reliable, and safe as adoption grows.
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 3, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            At Amazon, he architected and drove adoption of a microservice platform for monitor deployment across internal tools and AWS CloudWatch. The platform continuously updates monitor state by scraping multiple APIs and S3 datasets, ingesting SNS notifications, and reconciling infrastructure changes. He also designed and owns two Java-like PDL workflows used on every infrastructure change path, with pre/post execution checks and automated rollback guardrails as the org standard for change safety.
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 3, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            He pioneered a mission-critical system's Spec-Driven Development strategy, architecting a centralized AI intelligence library using a hub-and-spoke model that allows any agent to inherit full architectural context across 12+ pipelines. He drove this pattern org-wide, integrating spec creation directly into quarterly and sprint planning — turning documentation into a living, agent-readable engineering asset.
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 4, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            Eric builds and mentors high-performing teams while setting platform direction across 20 engineers building on the platform, 100+ users interacting through the UI, and multiple backend automation jobs that depend on the same safety model.
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2, border: `1px solid ${palette.accent}30` }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 3 }}>
            Enterprise Platform Leadership
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 3, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            My career spans two chapters of this work:
          </Typography>

          <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 600, mb: 1.5, fontSize: { xs: 16, md: 18 } }}>
            At Prudential Financial (SRE / Cloud Engineering)
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3, '& li': { mb: 0.75, lineHeight: 1.7, fontSize: { xs: 15, md: 18 }, color: palette.text } }}>
            <li>Enterprise monitoring standardization (VitalNet)</li>
            <li>Multi-factor authentication platform ownership (RSA Self Service Portal + Mobile App)</li>
            <li>QR Code MFA enrollment portal — adopted by all enterprise help desks</li>
            <li>Sole owner of critical financial reporting during COVID-19</li>
          </Box>

          <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 600, mb: 1.5, fontSize: { xs: 16, md: 18 } }}>
            At Amazon (SDE III / System Development Engineer)
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3, '& li': { mb: 0.75, lineHeight: 1.7, fontSize: { xs: 15, md: 18 }, color: palette.text } }}>
            <li>Microservice monitor deployment platform spanning internal tools and AWS CloudWatch</li>
            <li>Two Java-like PDL workflows for pre/post checks and automated rollback on every infrastructure change</li>
            <li>Org-standard change safety platform used by 20 engineers, 100+ UI users, and multiple backend jobs</li>
          </Box>

          <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 600, mb: 1.5, fontSize: { xs: 16, md: 18 } }}>
            Org-Wide Impact
          </Typography>
          <Box sx={{ pl: 1 }}>
            {leadershipBullets.map((bullet) => (
              <Box key={bullet} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                <Typography sx={{ color: palette.accent, fontWeight: 700, fontSize: 18, lineHeight: 1.7, flexShrink: 0 }}>
                  &#x2726;
                </Typography>
                <Typography variant="body1" sx={{ color: palette.text, fontSize: { xs: 15, md: 18 }, lineHeight: 1.7 }}>
                  {bullet}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 500, mb: 2 }}>
            Mission
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 4, fontSize: { xs: 16, md: 20 }, lineHeight: 1.8 }}>
            To empower organizations and individuals to achieve more through technology — by building resilient systems, fostering innovation, and leading with autonomy, trust, and shared context. Outside of engineering: a dad, a marathoner, a constant reader on AI and distributed systems, and a hands-on team builder.
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