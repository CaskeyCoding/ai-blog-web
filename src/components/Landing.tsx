import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Container, Skeleton } from '@mui/material';
import { palette } from '../theme';
import { getBlogPosts, BlogPost } from '../api/blog';

function stripPreview(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const sections = [
  {
    title: 'Experience',
    description: 'Enterprise-scale systems & career journey',
    path: '/ericcaskey',
    icon: '🏗️',
  },
  {
    title: 'Blog',
    description: 'Technical writing on platform architecture, safety & scale',
    path: '/blog',
    icon: '✍️',
  },
  {
    title: 'Profile',
    description: 'Leadership scope, skills & career',
    path: '/profile',
    icon: '📋',
  },
];

export default function Landing() {
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then(posts => {
        if (posts.length > 0) {
          const sorted = [...posts].sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setLatestPost(sorted[0]);
        }
      })
      .catch(() => {})
      .finally(() => setPostLoading(false));
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.background,
      px: 2,
      py: { xs: 4, md: 6 },
    }}>
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <img src="/caskeycoding.png" alt="CaskeyCoding" style={{ height: 48, opacity: 0.9 }} />
        </Box>

        <Typography variant="h4" sx={{
          color: palette.primary,
          fontWeight: 700,
          mb: 1,
          textAlign: 'center',
        }}>
          Enterprise Platform Engineering at Scale
        </Typography>

        <Typography variant="body1" sx={{
          color: palette.textSecondary,
          mb: 1.5,
          textAlign: 'center',
          maxWidth: 600,
        }}>
          I architect enterprise-scale software platforms and change-safety systems that keep
          infrastructure current, reliable, and safe as adoption grows across teams.
        </Typography>

        <Typography variant="body2" sx={{
          color: palette.textSecondary,
          mb: 4,
          textAlign: 'center',
          maxWidth: 560,
        }}>
          Currently at Amazon: building microservice-based monitor deployment systems integrated
          with internal tools and AWS CloudWatch, plus org-standard orchestration guardrails for
          pre/post checks and automated rollback.
        </Typography>

        {/* Section Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          width: '100%',
          maxWidth: 680,
          mb: 4,
        }}>
          {sections.map((section) => (
            <Paper
              key={section.path}
              component={Link}
              to={section.path}
              elevation={0}
              sx={{
                p: 2.5,
                textDecoration: 'none',
                border: `1px solid ${palette.border}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: palette.primary,
                  boxShadow: '0 4px 16px rgba(0,51,102,0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{section.icon}</Typography>
              <Typography variant="subtitle1" sx={{ color: palette.primary, fontWeight: 600, mb: 0.5 }}>
                {section.title}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                {section.description}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Latest Blog Post */}
        {postLoading ? (
          <Paper elevation={0} sx={{
            p: 3,
            width: '100%',
            maxWidth: 680,
            border: `1px solid ${palette.border}`,
          }}>
            <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="90%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={120} />
          </Paper>
        ) : latestPost ? (
          <Paper
            component={Link}
            to={`/blog/${latestPost.slug || latestPost.postId}`}
            elevation={0}
            sx={{
              p: 3,
              width: '100%',
              maxWidth: 680,
              textDecoration: 'none',
              border: `1px solid ${palette.border}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: palette.accent,
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography variant="overline" sx={{ color: palette.accent, fontWeight: 600, letterSpacing: '0.08em' }}>
              Latest Post
            </Typography>
            <Typography variant="h6" sx={{ color: palette.primary, mb: 0.5, lineHeight: 1.3 }}>
              {latestPost.title}
            </Typography>
            {latestPost.content && (
              <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 1 }}>
                {stripPreview(latestPost.content).substring(0, 120)}…
              </Typography>
            )}
            {latestPost.createdAt && (
              <Typography variant="caption" sx={{ color: palette.textSecondary }}>
                {new Date(latestPost.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </Paper>
        ) : null}

        <Typography variant="caption" sx={{ mt: 6, color: palette.textSecondary }}>
          © {new Date().getFullYear()} Eric Caskey
        </Typography>
      </Container>
    </Box>
  );
}
