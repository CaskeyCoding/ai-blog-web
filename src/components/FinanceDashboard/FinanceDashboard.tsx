import React, { useState, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, Button, Tabs, Tab, Chip, CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { palette } from '../../theme';
import PortfolioOverview from './PortfolioOverview';
import PositionTable from './PositionTable';
import CommitteeView from './CommitteeView';
import Recommendations from './Recommendations';
import type { FullReviewData } from '../../api/finance';

const GRADE_COLORS: Record<string, string> = {
  'A+': '#16a34a', A: '#22c55e', 'B+': '#eab308', B: '#f59e0b',
  C: '#f97316', D: '#ef4444', F: '#dc2626',
};

export default function FinanceDashboard() {
  const [reviewData, setReviewData] = useState<FullReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const response = await fetch('/api/finance/review-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_content: text }),
      });

      if (!response.ok) throw new Error('Review failed');
      const data: FullReviewData = await response.json();
      setReviewData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV');
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
    </Container>
  );
}
