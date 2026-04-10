import React, { useState, useCallback, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button, Tabs, Tab, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import { palette } from '../../theme';
import { API_CONFIG } from '../../config';
import { fetchAuthSession } from 'aws-amplify/auth';
import PortfolioOverview from './PortfolioOverview';
import PositionTable from './PositionTable';
import CommitteeView from './CommitteeView';
import Recommendations from './Recommendations';
import ChatPanel from './ChatPanel';
import IdealProfile from './IdealProfile';
import SuggestionsPanel from './Suggestions';
import { listReviews, type FullReviewData, type ReviewSummary } from '../../api/finance';
import { GRADE_COLORS } from './gradeColors';

export default function FinanceDashboard() {
  const [reviewData, setReviewData] = useState<FullReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [pastReviews, setPastReviews] = useState<ReviewSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    listReviews()
      .then(setPastReviews)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_CONFIG.API_URL}/finance/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csv_content: text }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Review failed (${response.status})`);
      }
      const data: FullReviewData = await response.json();
      setReviewData(data);
      // Refresh history to include the new review
      listReviews().then(setPastReviews).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPastReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${API_CONFIG.API_URL}/finance/reviews?review_id=${encodeURIComponent(reviewId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error('Failed to load review');
      const result = await response.json();
      if (result.data) {
        setReviewData(result.data);
      } else {
        throw new Error('Review data not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (!reviewData && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
            Financial Position Reviewer
          </Typography>
          <Typography variant="body1" sx={{ color: palette.text, mb: 6, maxWidth: 600, mx: 'auto' }}>
            Upload your Fidelity Positions CSV to get a comprehensive portfolio analysis
            powered by an investor committee of Graham, Buffett, Lynch, Dalio, and Druckenmiller.
          </Typography>

          {error && (
            <Paper sx={{ p: 2, mb: 4, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          )}

          <Button
            component="label"
            variant="contained"
            size="large"
            startIcon={<UploadFileIcon />}
            sx={{
              background: palette.primary,
              px: 5, py: 2,
              fontSize: '1.1rem',
              '&:hover': { background: palette.accent },
            }}
          >
            Upload Positions CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileUpload}
            />
          </Button>

          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 3 }}>
            Export from Fidelity: Positions &rarr; Download &rarr; CSV
          </Typography>
        </Box>

        {/* Past reviews */}
        {(pastReviews.length > 0 || historyLoading) && (
          <Paper sx={{ mt: 6, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryIcon sx={{ color: palette.primary }} />
              <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700 }}>
                Past Reviews
              </Typography>
            </Box>
            {historyLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={40} />)}
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Grade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Value</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Positions</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Alerts</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastReviews.map(r => (
                      <TableRow key={r.review_id} hover sx={{ cursor: 'pointer' }} onClick={() => loadPastReview(r.review_id)}>
                        <TableCell>{new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 700, color: GRADE_COLORS[r.portfolio_grade] || palette.text }}>
                            {r.portfolio_grade}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">${Number(r.total_value).toLocaleString()}</TableCell>
                        <TableCell align="center">{r.position_count}</TableCell>
                        <TableCell align="center">
                          {r.alert_count > 0 && (
                            <Chip size="small" label={r.alert_count} color="warning" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: palette.primary, fontWeight: 600 }}>
                            Load
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={64} sx={{ mb: 3 }} />
        <Typography variant="h5" sx={{ color: palette.primary }}>
          Analyzing portfolio...
        </Typography>
        <Typography variant="body2" sx={{ color: palette.text, mt: 1 }}>
          Running investor committee evaluation
        </Typography>
      </Container>
    );
  }

  if (!reviewData) return null;

  const grade = reviewData.portfolio_grade;
  const gradeColor = GRADE_COLORS[grade] || palette.text;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Paper sx={{
          px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${gradeColor}10`, border: `2px solid ${gradeColor}`,
          borderRadius: 2, minWidth: 80,
        }}>
          <Typography variant="h3" sx={{ color: gradeColor, fontWeight: 800 }}>
            {grade}
          </Typography>
        </Paper>
        <Box>
          <Typography variant="h4" sx={{ color: palette.primary, fontWeight: 700 }}>
            Portfolio Health
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
            <Typography variant="body1" sx={{ color: palette.text }}>
              Value: <strong>${Number(reviewData.metrics.total_value).toLocaleString()}</strong>
            </Typography>
            <Typography variant="body1" sx={{ color: palette.text }}>
              Beta: <strong>{Number(reviewData.metrics.weighted_beta).toFixed(2)}</strong>
            </Typography>
            <Typography variant="body1" sx={{ color: palette.text }}>
              G/L: <strong>{Number(reviewData.metrics.total_gain_loss_pct).toFixed(1)}%</strong>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={`${reviewData.alerts.length} Alert${reviewData.alerts.length !== 1 ? 's' : ''}`}
            color={reviewData.alerts.some(a => a.severity === 'CRITICAL') ? 'error' : 'warning'}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Positions" />
          <Tab label="Committee" />
          <Tab label="Recommendations" />
          <Tab label="Ideal Profile" />
          <Tab label="Suggestions" />
          <Tab label="Chat" />
        </Tabs>
      </Box>

      {/* Tab content */}
      {tab === 0 && (
        <PortfolioOverview
          metrics={reviewData.metrics}
          alerts={reviewData.alerts}
          positions={reviewData.positions}
          committeeResults={reviewData.committee_results}
          recommendations={reviewData.recommendations}
        />
      )}
      {tab === 1 && (
        <PositionTable
          positions={reviewData.positions}
          committeeResults={reviewData.committee_results}
          recommendations={reviewData.recommendations}
        />
      )}
      {tab === 2 && (
        <CommitteeView committeeResults={reviewData.committee_results} />
      )}
      {tab === 3 && (
        <Recommendations
          recommendations={reviewData.recommendations}
          alerts={reviewData.alerts}
        />
      )}
      {tab === 4 && (
        <IdealProfile reviewData={reviewData} />
      )}
      {tab === 5 && (
        <SuggestionsPanel reviewData={reviewData} />
      )}
      {tab === 6 && (
        <ChatPanel reviewData={reviewData} />
      )}
    </Container>
  );
}
