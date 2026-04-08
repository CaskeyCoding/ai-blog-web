import React from 'react';
import { Button, Container, Typography, Box, Avatar, Paper } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const linkedInUrl = 'https://www.linkedin.com/in/ericrcaskey';
const portraitUrl = '/EricCaskey_TechnologyLeader.jpg';
const caskeyLogoUrl = '/caskeycoding.png';

const palette = {
  primary: '#003366', // deep blue
  accent: '#F5A623', // gold/orange
  background: '#f7f9fb',
  text: '#222',
};

const LogoContainer = styled(Box)({
  width: 60,
  height: 60,
  borderRadius: '8px',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '& img': {
    width: '80%',
    height: '80%',
    objectFit: 'contain'
  }
});

// Professional history data from Positions.csv
const timeline = [
  {
    title: 'Senior Software Development Engineer',
    company: 'Amazon',
    period: '2022–Present',
    location: 'New York City Metropolitan Area',
    description: 'Leading development of mission-critical systems at Amazon, driving innovation in infrastructure management solutions. Spearheading initiatives that enhance platform reliability and scalability while mentoring engineering teams.',
    logo: '/amazon-logo.png'
  },
  {
    title: 'Cloud Engineering & SRE',
    company: 'Prudential Financial',
    period: '2013–2022',
    location: 'Roseland, NJ',
    description: 'Progressive roles in remote access, automation, and cloud engineering. Delivered enterprise-scale MFA/VPN solutions, led automation initiatives, and played a key role in Prudential\'s remote work transformation.',
    logo: '/prudential-logo.png'
  },
  {
    title: 'Consultant',
    company: 'Workforce Opportunity Services',
    period: '2011–2013',
    location: 'Roseland, NJ',
    description: "Launched my technology career as a WOS consultant, rapidly mastering corporate IT environments and contributing to Prudential's remote access operations.",
    logo: '/wos-logo.jfif'
  },
  {
    title: 'Owner, Operator',
    company: 'Caskey Coding',
    period: '2015–2018',
    location: 'Elizabeth, NJ',
    description: 'Developed websites and SEO solutions for local businesses, helping the New Jersey community thrive online.',
    logo: caskeyLogoUrl,
  },
  {
    title: 'Military Police Officer',
    company: 'NJ Army National Guard',
    period: '2009–2015',
    location: 'Port Murray, NJ',
    description: 'Served as a Military Police Officer, supporting operations, disaster response, and new soldier mentorship.',
    logo: '/njng-logo.png'
  },
];

export default function EricCaskey() {
  return (
    <Box sx={{ background: palette.background, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box className="hero-section" sx={{ 
          mb: 8, 
          p: 4, 
          borderRadius: 4, 
          position: 'relative',
          background: 'linear-gradient(135deg, #fbfcfd 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 85% 15%, ${palette.accent}02 0%, transparent 50%),
              radial-gradient(circle at 15% 85%, ${palette.primary}02 0%, transparent 50%)
            `,
            borderRadius: 4,
            zIndex: 0
          }
        }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4} sx={{ position: 'relative', zIndex: 1 }}>
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }} 
            />
            
            <Box textAlign={{ xs: 'center', md: 'left' }} flex={1}>
              <Typography variant="h2" sx={{ 
                color: palette.primary, 
                fontWeight: 700, 
                mb: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: { xs: '50%', md: 0 },
                  transform: { xs: 'translateX(-50%)', md: 'none' },
                  width: 40,
                  height: 2,
                  background: palette.accent,
                  borderRadius: 1
                }
              }}>
                Eric Caskey
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#64748b', 
                fontWeight: 400, 
                mb: 3
              }}>
                Senior Software Development Engineer
              </Typography>
              <Typography variant="body1" sx={{ 
                color: palette.text, 
                mb: 4, 
                lineHeight: 1.7,
                maxWidth: 500,
                opacity: 0.9
              }}>
                Transforming complex challenges into elegant solutions at Amazon. Passionate about scalable systems, 
                team leadership, and driving innovation in cloud infrastructure.
              </Typography>
              
              <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  component="a"
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    background: palette.primary,
                    color: '#fff',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,51,102,0.15)',
                    textDecoration: 'none',
                    '&:hover': {
                      background: '#002a52',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 16px rgba(0,51,102,0.2)',
                      textDecoration: 'none'
                    },
                    '&:visited': {
                      color: '#fff'
                    }
                  }}
                >
                  Connect on LinkedIn
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  component={Link}
                  to="/profile"
                  sx={{ 
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      background: '#f8fafc',
                      borderColor: palette.primary,
                      color: palette.primary
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Timeline Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ color: palette.primary, fontWeight: 600, mb: 2, textAlign: 'center' }}>
            Professional Journey
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#64748b', 
            textAlign: 'center', 
            mb: 4,
            maxWidth: 600,
            margin: '0 auto 2rem auto'
          }}>
            A decade of technical leadership and innovation across enterprise and cloud platforms
          </Typography>
          
          {/* Subtle section divider */}
          <Box sx={{ 
            width: 24, 
            height: 1, 
            background: palette.accent,
            margin: '0 auto 3rem auto'
          }} />
          
          <Timeline sx={{ 
            '& .MuiTimelineItem-root': {
              minHeight: { xs: 100, sm: 120 },
              '&:before': {
                display: { xs: 'none', sm: 'block' }
              }
            },
            '& .MuiTimelineContent-root': {
              flex: '1 1 auto',
              minWidth: { xs: '100%', sm: '300px' },
              maxWidth: { xs: '100%', sm: '600px' },
              pl: { xs: 2, sm: 3 },
              pr: 0
            }
          }}>
            {timeline.map((item, index) => (
              <TimelineItem key={index} sx={{ 
                '&::before': { 
                  display: { xs: 'none', sm: 'block' },
                  flex: '0 0 auto',
                  content: '""'
                }
              }}>
                <TimelineSeparator>
                  <LogoContainer sx={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: palette.accent,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <img src={item.logo} alt={`${item.company} logo`} />
                  </LogoContainer>
                  {index < timeline.length - 1 && (
                    <TimelineConnector sx={{ 
                      background: '#cbd5e1',
                      width: 2,
                      height: { xs: 40, sm: 60 },
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={0} sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    mb: 2,
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    borderRadius: 2,
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: palette.accent,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                    }
                  }}>
                    {/* Period indicator with animation */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      opacity: 0.8,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}>
                      <Box sx={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: '50%', 
                        background: palette.accent,
                        animation: 'pulse 2s infinite'
                      }} />
                      <Typography variant="caption" sx={{ 
                        color: '#64748b', 
                        fontWeight: 500,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        {item.period} • {item.location}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" sx={{ 
                      color: palette.primary, 
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="subtitle1" sx={{ 
                      color: '#64748b', 
                      fontWeight: 500,
                      mb: 2,
                      fontSize: { xs: '0.85rem', sm: '0.9rem' }
                    }}>
                      {item.company}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: palette.text,
                      lineHeight: 1.6,
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      opacity: 0.9
                    }}>
                      {item.description}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      </Container>
    </Box>
  );
}

export {}; 