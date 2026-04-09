import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import './config/amplify';  // Import Amplify configuration
import { getBlogPosts, getBlogPost, BlogPost as BlogPostType } from './api/blog';
import { triggerAgentRevision, scheduleBlogPost, generateBlogPost, getAgentStatus } from './api/agent';
import { generateLinkedInPost } from './api/linkedin';
import Landing from './components/Landing';
import EricCaskey from './components/EricCaskey';
import Profile from './components/Profile';
import Footer from './components/Footer';
import { Container, Typography, Paper, Box, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton } from '@mui/material';
import InsertCommentOutlinedIcon from '@mui/icons-material/InsertCommentOutlined';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const palette = {
  primary: '#003366',
  accent: '#F5A623',
  text: '#222222',
  background: '#ffffff',
  error: '#d32f2f'
};

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[-:| ]+$/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const markdownComponents: Record<string, React.FC<any>> = {
  h1: ({ children, ...props }: any) => (
    <Typography variant="h3" sx={{ color: palette.primary, fontWeight: 700, mt: 5, mb: 2, lineHeight: 1.3 }} {...props}>{children}</Typography>
  ),
  h2: ({ children, ...props }: any) => (
    <Typography variant="h4" sx={{ color: palette.primary, fontWeight: 600, mt: 4, mb: 2, lineHeight: 1.3 }} {...props}>{children}</Typography>
  ),
  h3: ({ children, ...props }: any) => (
    <Typography variant="h5" sx={{ color: palette.primary, fontWeight: 600, mt: 3, mb: 1.5, lineHeight: 1.3 }} {...props}>{children}</Typography>
  ),
  h4: ({ children, ...props }: any) => (
    <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 600, mt: 2.5, mb: 1, lineHeight: 1.3 }} {...props}>{children}</Typography>
  ),
  h5: ({ children, ...props }: any) => (
    <Typography variant="subtitle1" sx={{ color: palette.primary, fontWeight: 600, mt: 2, mb: 1 }} {...props}>{children}</Typography>
  ),
  h6: ({ children, ...props }: any) => (
    <Typography variant="subtitle2" sx={{ color: palette.primary, fontWeight: 600, mt: 2, mb: 1 }} {...props}>{children}</Typography>
  ),
  p: ({ children, ...props }: any) => (
    <Typography variant="body1" sx={{ color: palette.text, mb: 2, lineHeight: 1.8, fontSize: '1.1rem' }} {...props}>{children}</Typography>
  ),
  a: ({ href, children, ...props }: any) => (
    <Link to={href?.startsWith('/') ? href : '#'} onClick={(e: React.MouseEvent) => {
      if (href && !href.startsWith('/')) {
        e.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }} style={{ color: palette.accent, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }} {...props}>{children}</Link>
  ),
  blockquote: ({ children, ...props }: any) => (
    <Box component="blockquote" sx={{ borderLeft: `3px solid ${palette.accent}`, pl: 3, py: 1, my: 3, mx: 0, background: '#fafbfc', borderRadius: '0 8px 8px 0' }} {...props}>{children}</Box>
  ),
  ul: ({ children, ...props }: any) => (
    <Box component="ul" sx={{ pl: 3, mb: 2, '& li': { mb: 0.5, lineHeight: 1.8, fontSize: '1.1rem', color: palette.text } }} {...props}>{children}</Box>
  ),
  ol: ({ children, ...props }: any) => (
    <Box component="ol" sx={{ pl: 3, mb: 2, '& li': { mb: 0.5, lineHeight: 1.8, fontSize: '1.1rem', color: palette.text } }} {...props}>{children}</Box>
  ),
  img: ({ src, alt, ...props }: any) => (
    <Box component="img" src={src} alt={alt} sx={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', my: 2, display: 'block' }} {...props} />
  ),
  table: ({ children, ...props }: any) => (
    <Box sx={{ overflowX: 'auto', mb: 3 }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }} {...props}>{children}</Box>
    </Box>
  ),
  th: ({ children, ...props }: any) => (
    <Box component="th" sx={{ textAlign: 'left', p: 1.5, borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: palette.primary, background: '#f8fafc' }} {...props}>{children}</Box>
  ),
  td: ({ children, ...props }: any) => (
    <Box component="td" sx={{ p: 1.5, borderBottom: '1px solid #f1f5f9', color: palette.text }} {...props}>{children}</Box>
  ),
  hr: (props: any) => (
    <Box component="hr" sx={{ border: 'none', borderTop: '1px solid #e2e8f0', my: 4 }} {...props} />
  ),
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const inline = !className;
    if (inline) {
      return (
        <Box component="code" sx={{ background: '#f1f5f9', color: '#0f172a', px: 0.75, py: 0.25, borderRadius: '4px', fontSize: '0.9em', fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace' }} {...props}>{children}</Box>
      );
    }
    return (
      <SyntaxHighlighter
        style={oneLight}
        language={match ? match[1] : 'text'}
        PreTag="div"
        customStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', margin: '16px 0' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  },
  pre: ({ children }: any) => <>{children}</>,
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

function BlogPost() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        setError(null);
        const fetchedPost = await getBlogPost(postId);
        setPost(fetchedPost);
      } catch (err: any) {
        console.error('Error fetching blog post:', err);
        setError(err.message || 'Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    document.title = post ? `${post.title} | Eric Caskey` : 'Blog | Eric Caskey';
    return () => { document.title = 'Eric Caskey – Enterprise Platform Engineering'; };
  }, [post]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width={120} sx={{ mb: 3 }} />
        <Paper elevation={1} sx={{ p: 4, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 2 }}>
          <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={140} />
          </Box>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="text" width={i === 7 ? '60%' : '100%'} sx={{ mb: 1 }} />
          ))}
        </Paper>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 3, background: palette.background, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error Loading Blog Post
          </Typography>
          <Typography variant="body1" color="error" sx={{ mb: 3 }}>
            {error || 'Blog post not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/blog"
            sx={{ background: palette.primary, '&:hover': { background: palette.accent } }}
          >
            Back to Blog
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        component={Link}
        to="/blog"
        sx={{ mb: 3, color: palette.primary }}
      >
        ← Back to Blog
      </Button>
      
      <Paper elevation={1} sx={{ 
        p: { xs: 3, sm: 4, md: 5 }, 
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: 2
      }}>
        <Typography variant="h3" sx={{ 
          color: palette.primary, 
          fontWeight: 600, 
          mb: 2,
          lineHeight: 1.3
        }}>
          {post.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            By {post.author || 'Eric Caskey'}
          </Typography>
          {post.createdAt && (
            <>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {new Date(post.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </>
          )}
          {post.content && (
            <>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {readingTime(post.content)}
              </Typography>
            </>
          )}
        </Box>
        
        {post.imageUrl && (
          <Box sx={{ mb: 4 }}>
            <img 
              src={post.imageUrl} 
              alt={post.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            />
          </Box>
        )}
        
        <Box sx={{ '& > :first-of-type': { mt: 0 } }}>
          {post.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          ) : (
            <Typography variant="body1" sx={{ color: '#64748b', fontStyle: 'italic' }}>
              Content not available
            </Typography>
          )}
        </Box>
        
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
            {post.tags.map((tag: string) => (
              <Box
                key={tag}
                sx={{
                  background: `${palette.accent}10`,
                  color: palette.accent,
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  borderRadius: 1,
                  padding: '4px 8px',
                  border: `1px solid ${palette.accent}20`
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

function Blog() {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getBlogPosts();
        setPosts(fetchedPosts);
      } catch (err: any) {
        console.error('Error fetching blog posts:', err);
        setError(err.message || 'Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    document.title = 'Blog | Eric Caskey';
    return () => { document.title = 'Eric Caskey – Enterprise Platform Engineering'; };
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width={160} height={48} sx={{ mx: 'auto', mb: 6 }} />
        {[0, 1, 2].map((i) => (
          <Paper key={i} elevation={1} sx={{ p: 4, mb: 4, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 2 }}>
            <Skeleton variant="text" width="70%" height={36} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={130} />
              <Skeleton variant="text" width={80} />
            </Box>
            <Skeleton variant="text" width="100%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="100%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="45%" sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={70} height={26} />
              <Skeleton variant="rounded" width={90} height={26} />
            </Box>
          </Paper>
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 3, background: palette.background, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error Loading Blog Posts
          </Typography>
          <Typography variant="body1" color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ background: palette.primary, '&:hover': { background: palette.accent } }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', background: palette.background }}>
          <InsertCommentOutlinedIcon sx={{ fontSize: 64, color: palette.accent, mb: 2 }} />
          <Typography variant="h5" sx={{ color: palette.primary, fontWeight: 600, mb: 1 }}>
            No blog posts yet
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 3 }}>
            Check back soon for insights and technical discussions.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ color: palette.primary, fontWeight: 700, mb: 6, textAlign: 'center' }}>
        Blog
      </Typography>
      
      <Box>
        {posts.map((post) => {
          const preview = post.content ? stripMarkdown(post.content) : '';
          return (
            <Paper key={post.postId} elevation={1} sx={{ 
              p: 4, 
              mb: 4,
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              },
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h4" sx={{ 
                color: palette.primary, 
                fontWeight: 600, 
                mb: 2,
                lineHeight: 1.3,
                '& a': {
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: palette.accent
                  }
                }
              }}>
                <Link to={`/blog/${post.slug || post.postId}`}>
                  {post.title}
                </Link>
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  By {post.author || 'Eric Caskey'}
                </Typography>
                {post.createdAt && (
                  <>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </>
                )}
                {post.content && (
                  <>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {readingTime(post.content)}
                    </Typography>
                  </>
                )}
              </Box>
              
              {post.imageUrl && (
                <Box sx={{ mb: 3 }}>
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" sx={{ 
                color: palette.text, 
                mb: 3,
                lineHeight: 1.7
              }}>
                {preview ? (
                  preview.length > 200 ? (
                    <>
                      {preview.substring(0, 200)}...
                      <Link 
                        to={`/blog/${post.slug || post.postId}`}
                        style={{ 
                          color: palette.accent, 
                          textDecoration: 'none',
                          fontWeight: 500,
                          marginLeft: '8px'
                        }}
                      >
                        Read more →
                      </Link>
                    </>
                  ) : (
                    preview
                  )
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                      Preview not available.
                    </Typography>
                    <Link 
                      to={`/blog/${post.slug || post.postId}`}
                      style={{ 
                        color: palette.accent, 
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      Read full post →
                    </Link>
                  </Box>
                )}
              </Typography>
              
              {post.tags && post.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.tags.map((tag: string) => (
                    <Box
                      key={tag}
                      sx={{
                        background: `${palette.accent}10`,
                        color: palette.accent,
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        borderRadius: 1,
                        padding: '4px 8px',
                        border: `1px solid ${palette.accent}20`
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    </Container>
  );
}

function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ [postId: string]: string }>({});
  const [generatingPost, setGeneratingPost] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Poll task status if we have a taskId
  useEffect(() => {
    if (!taskId) return;
    
    const pollStatus = async () => {
      try {
        const status = await getAgentStatus(taskId);
        setTaskStatus(status.status);
        if (status.status === 'COMPLETED') {
          // Refresh posts to show the new one
          const updatedPosts = await getBlogPosts();
          setPosts(updatedPosts);
          setTaskId(null);
          setTaskStatus(null);
          setGeneratingPost(false);
        } else if (status.status === 'FAILED') {
          setError('Agent task failed: ' + (status.error || 'Unknown error'));
          setTaskId(null);
          setTaskStatus(null);
          setGeneratingPost(false);
        }
      } catch (err: any) {
        setError('Failed to get task status: ' + err.message);
        setTaskId(null);
        setTaskStatus(null);
        setGeneratingPost(false);
      }
    };

    const interval = setInterval(pollStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [taskId]);

  const handleGeneratePost = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGeneratingPost(true);
    setError(null);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      const result = await generateBlogPost(prompt, tagList, imageUrl.trim() || undefined);
      setTaskId(result.taskId);
      setTaskStatus('IN_PROGRESS');
    } catch (err: any) {
      setError('Failed to generate post: ' + err.message);
      setGeneratingPost(false);
    }
  };

  const handleAgentRevision = async (postId: string) => {
    setActionStatus((s) => ({ ...s, [postId]: 'Revising...' }));
    try {
      await triggerAgentRevision(postId);
      setActionStatus((s) => ({ ...s, [postId]: 'Revision triggered!' }));
    } catch (err: any) {
      setActionStatus((s) => ({ ...s, [postId]: 'Error: ' + err.message }));
    }
  };

  const handleSchedule = async (postId: string) => {
    setSelectedPostId(postId);
    setScheduledTime('');
    setScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedPostId || !scheduledTime) return;
    
    setScheduleDialogOpen(false);
    setActionStatus((s) => ({ ...s, [selectedPostId]: 'Scheduling...' }));
    try {
      await scheduleBlogPost(selectedPostId, scheduledTime);
      setActionStatus((s) => ({ ...s, [selectedPostId]: 'Scheduled!' }));
    } catch (err: any) {
      setActionStatus((s) => ({ ...s, [selectedPostId]: 'Error: ' + err.message }));
    }
    setSelectedPostId(null);
    setScheduledTime('');
  };

  const handleLinkedIn = async (postId: string) => {
    setActionStatus((s) => ({ ...s, [postId]: 'Generating LinkedIn post...' }));
    try {
      await generateLinkedInPost(postId);
      setActionStatus((s) => ({ ...s, [postId]: 'LinkedIn post generated!' }));
    } catch (err: any) {
      setActionStatus((s) => ({ ...s, [postId]: 'Error: ' + err.message }));
    }
  };

  if (loading) return <div>Loading AI-generated content...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ color: palette.primary, fontWeight: 600, mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* New Post Generation Form */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, background: '#fff' }}>
        <Typography variant="h6" sx={{ color: palette.primary, mb: 3 }}>
          Generate New Blog Post
        </Typography>
        <Stack spacing={3}>
          <TextField
            label="Prompt"
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to write about..."
            disabled={generatingPost}
          />
          <TextField
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., technology, leadership, cloud"
            disabled={generatingPost}
          />
          <TextField
            label="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={generatingPost}
          />
          <Button
            variant="contained"
            onClick={handleGeneratePost}
            disabled={generatingPost}
            sx={{ 
              background: palette.primary,
              '&:hover': { background: palette.accent }
            }}
          >
            {generatingPost ? 'Generating...' : 'Generate Post'}
          </Button>
          {taskStatus && (
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Status: {taskStatus}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Existing Posts */}
      <Typography variant="h6" sx={{ color: palette.primary, mb: 3 }}>
        Existing Posts
      </Typography>
      {posts.map((post) => (
        <Paper key={post.postId} elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ color: palette.primary }}>
            {post.title}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleAgentRevision(post.postId)}
              disabled={actionStatus[post.postId]?.includes('...')}
            >
              {actionStatus[post.postId] || 'Revise with AI'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSchedule(post.postId)}
              disabled={actionStatus[post.postId]?.includes('...')}
            >
              Schedule
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleLinkedIn(post.postId)}
              disabled={actionStatus[post.postId]?.includes('...')}
            >
              Generate LinkedIn Post
            </Button>
          </Box>
        </Paper>
      ))}

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Schedule Time (ISO format)"
            type="datetime-local"
            fullWidth
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleSubmit} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function Navigation() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: { xs: 1.5, sm: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" sx={{ 
              color: palette.primary, 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              Eric Caskey
            </Typography>
          </Link>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 3 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 1, sm: 0 },
            alignItems: 'center'
          }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: palette.primary,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                fontWeight: 500
              }}>
                Home
              </Typography>
            </Link>
            <Link to="/ericcaskey" style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: palette.primary,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                fontWeight: 500
              }}>
                Case Studies
              </Typography>
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: palette.primary,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                fontWeight: 500
              }}>
                Profile
              </Typography>
            </Link>
            <Link to="/blog" style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: palette.primary,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                fontWeight: 500
              }}>
                Blog
              </Typography>
            </Link>
            <Link to="/admin" style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: palette.primary,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                fontWeight: 500
              }}>
                Admin
              </Typography>
            </Link>
            
            {isAuthenticated && user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <Typography sx={{ 
                  color: palette.primary,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  fontWeight: 400
                }}>
                  {user.username}
                </Typography>
                <Button
                  size="small"
                  onClick={handleLogout}
                  disabled={isLoading}
                  sx={{
                    color: palette.error,
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    },
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </nav>
  );
}

function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Landing page — standalone, no nav/footer */}
        <Route path="/" element={<Landing />} />

        {/* All other pages get the nav + footer shell */}
        <Route path="*" element={
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navigation />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/ericcaskey" element={<EricCaskey />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/blog/:postId" element={<BlogPost />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        } />
      </Routes>
    </Router>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
    },
    secondary: {
      main: palette.accent,
    },
    error: {
      main: palette.error,
    },
    background: {
      default: palette.background,
    },
    text: {
      primary: palette.text,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
