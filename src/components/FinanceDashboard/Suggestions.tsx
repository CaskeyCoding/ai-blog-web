import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Paper, Typography, ToggleButtonGroup, ToggleButton, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  LinearProgress, Alert as MuiAlert, Divider,
} from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { palette } from '../../theme';
import {
  getSuggestions,
  type FullReviewData,
  type SuggestionsData,
  type StockSuggestion,
} from '../../api/finance';

const GRADE_COLORS: Record<string, string> = {
  'A+': '#16a34a', A: '#22c55e', 'B+': '#eab308', B: '#f59e0b',
  C: '#f97316', D: '#ef4444', F: '#dc2626',
};

const GAP_ICONS: Record<string, React.ReactNode> = {
  HIGH: <ErrorOutlineIcon sx={{ fontSize: 18, color: '#ef4444' }} />,
  MEDIUM: <WarningAmberIcon sx={{ fontSize: 18, color: '#f59e0b' }} />,
  LOW: <InfoOutlinedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />,
};

interface Props {
  reviewData: FullReviewData;
}

export default function SuggestionsPanel({ reviewData }: Props) {
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [data, setData] = useState<SuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (profile: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSuggestions(reviewData, profile);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reviewData]);

  useEffect(() => { load('moderate'); }, [load]);

  const handleProfileChange = (_: any, value: string | null) => {
    if (!value) return;
    setRiskProfile(value);
    load(value);
  };

  if (loading && !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ color: palette.primary }}>
          Scanning for opportunities...
        </Typography>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 1 }}>
          Querying live market data for stocks that would improve your portfolio
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Risk selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <TipsAndUpdatesIcon sx={{ color: palette.accent, fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700 }}>
            Stock Suggestions
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 2 }}>
          Real stocks from the market that would address your portfolio's specific weaknesses,
          backed by live fundamentals from Financial Modeling Prep.
        </Typography>
        <ToggleButtonGroup value={riskProfile} exclusive onChange={handleProfileChange} sx={{ mb: 1 }}>
          <ToggleButton value="conservative" sx={{ px: 3 }}>Conservative</ToggleButton>
          <ToggleButton value="moderate" sx={{ px: 3 }}>Moderate</ToggleButton>
          <ToggleButton value="aggressive" sx={{ px: 3 }}>Aggressive</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {error && (
        <MuiAlert severity="error" sx={{ mb: 3 }}>{error}</MuiAlert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {data && (
        <>
          {/* Gap analysis */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
              Portfolio Gaps Identified
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.gap_analysis.map((gap, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  {GAP_ICONS[gap.severity] || GAP_ICONS.LOW}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{gap.title}</Typography>
                    <Typography variant="body2" sx={{ color: palette.textSecondary }}>{gap.description}</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={gap.severity}
                    color={gap.severity === 'HIGH' ? 'error' : gap.severity === 'MEDIUM' ? 'warning' : 'info'}
                    variant="outlined"
                    sx={{ ml: 'auto', flexShrink: 0 }}
                  />
                </Paper>
              ))}
              {data.gap_analysis.length === 0 && (
                <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                  No significant gaps detected in your portfolio structure.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Suggestions table */}
          {data.suggestions.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 1 }}>
                Recommended Additions
              </Typography>
              <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 2 }}>
                Stocks ranked by projected committee grade. All data is live from the market.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Symbol</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Grade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sector</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">P/E</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">ROE</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Beta</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Div Yield</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Why It Helps</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.suggestions.map((s) => (
                      <SuggestionRow key={s.symbol} suggestion={s} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {data.suggestions.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: palette.textSecondary }}>
                No suggestions available. This may indicate the FMP API key is not configured
                or the screener returned no results.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

function SuggestionRow({ suggestion: s }: { suggestion: StockSuggestion }) {
  const gradeColor = GRADE_COLORS[s.projected_grade] || palette.text;
  return (
    <TableRow hover sx={{ '&:last-child td': { border: 0 } }}>
      <TableCell sx={{ fontWeight: 700 }}>{s.symbol}</TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 160 }} noWrap title={s.name}>
          {s.name}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2" sx={{ fontWeight: 700, color: gradeColor }}>
          {s.projected_grade}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ px: 0.5, py: 0.25, borderRadius: 1, bgcolor: palette.background }}>
          {s.sector}
        </Typography>
      </TableCell>
      <TableCell align="right">{s.price != null ? `$${s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '--'}</TableCell>
      <TableCell align="right">{s.pe_ratio != null ? s.pe_ratio.toFixed(1) : '--'}</TableCell>
      <TableCell align="right">{s.roe != null ? `${(s.roe * 100).toFixed(1)}%` : '--'}</TableCell>
      <TableCell align="right">{s.beta != null ? s.beta.toFixed(2) : '--'}</TableCell>
      <TableCell align="right">{s.dividend_yield != null && s.dividend_yield > 0.005 ? `${(s.dividend_yield * 100).toFixed(1)}%` : '--'}</TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ color: palette.textSecondary, maxWidth: 240, fontSize: '0.75rem' }}>
          {s.grade_rationale}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
