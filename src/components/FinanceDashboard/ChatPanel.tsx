import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, CircularProgress, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { palette } from '../../theme';
import { sendChatMessage, type ChatMessage, type FullReviewData } from '../../api/finance';

const SUGGESTIONS = [
  'What are my riskiest positions?',
  'Which stocks should I trim first?',
  'How diversified is my portfolio?',
  'Explain my portfolio grade',
  'What would Buffett think of my holdings?',
];

interface Props {
  reviewData: FullReviewData;
}

export default function ChatPanel({ reviewData }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await sendChatMessage(msg, messages, reviewData);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I couldn't process that. ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, reviewData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)', minHeight: 400 }}>
      {/* Messages area */}
      <Paper
        ref={scrollRef}
        variant="outlined"
        sx={{
          flex: 1, overflow: 'auto', p: 2, mb: 2,
          bgcolor: palette.background,
          borderColor: palette.border,
        }}
      >
        {messages.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: palette.primary, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: palette.primary, mb: 1 }}>
              Portfolio AI Advisor
            </Typography>
            <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 3, maxWidth: 480, mx: 'auto' }}>
              Ask questions about your portfolio analysis. The AI has full context
              of your positions, committee scores, recommendations, and alerts.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {SUGGESTIONS.map(s => (
                <Chip
                  key={s}
                  label={s}
                  variant="outlined"
                  onClick={() => send(s)}
                  sx={{
                    cursor: 'pointer',
                    borderColor: palette.border,
                    '&:hover': { bgcolor: `${palette.primary}08`, borderColor: palette.primary },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 1.5,
              mb: 2,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: m.role === 'user' ? palette.primary : palette.accent,
              color: '#fff', mt: 0.5,
            }}>
              {m.role === 'user'
                ? <PersonIcon sx={{ fontSize: 18 }} />
                : <SmartToyIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2, maxWidth: '75%',
                bgcolor: m.role === 'user' ? palette.primary : palette.surface,
                color: m.role === 'user' ? '#fff' : palette.text,
                borderRadius: 2,
                border: m.role === 'assistant' ? `1px solid ${palette.border}` : 'none',
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
              >
                {m.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: palette.accent, color: '#fff', mt: 0.5,
            }}>
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2, bgcolor: palette.surface, borderRadius: 2,
                border: `1px solid ${palette.border}`,
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                Analyzing your portfolio...
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Input area */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask about your portfolio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: palette.surface,
            },
          }}
        />
        <IconButton
          onClick={() => send()}
          disabled={!input.trim() || loading}
          sx={{
            bgcolor: palette.primary,
            color: '#fff',
            borderRadius: 2,
            width: 44, height: 44,
            '&:hover': { bgcolor: palette.accent },
            '&.Mui-disabled': { bgcolor: palette.border, color: palette.textSecondary },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
