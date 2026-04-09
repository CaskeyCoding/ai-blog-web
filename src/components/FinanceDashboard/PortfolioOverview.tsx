import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material';
import { palette } from '../../theme';
import type { Alert, CommitteeConsensus, PortfolioMetrics, PositionData, Recommendation } from '../../api/finance';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#16a34a', A: '#22c55e', 'B+': '#eab308', B: '#f59e0b',
  C: '#f97316', D: '#ef4444', F: '#dc2626',
};

interface Props {
  metrics: PortfolioMetrics;
  alerts: Alert[];
  positions: PositionData[];
  committeeResults: CommitteeConsensus[];
  recommendations: Recommendation[];
}

export default function PortfolioOverview({ metrics, alerts, positions, committeeResults, recommendations }: Props) {
  const activeRecs = recommendations.filter(r => r.action !== 'HOLD').slice(0, 5);

  return (
    <Box>
      {/* Alerts */}
      {alerts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, border: '1px solid #fecaca', bgcolor: '#fffbeb' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Alerts ({alerts.length})
          </Typography>
          {alerts.map((alert, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: SEVERITY_COLORS[alert.severity] || '#94a3b8',
              }} />
              <Typography variant="body2">
                <strong>{alert.severity}:</strong> {alert.message}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Allocation breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
              Allocation
            </Typography>
            {Object.entries(metrics.allocation_by_classification).map(([cls, pct]) => {
              const pctNum = Number(pct) * 100;
              const isOver = pctNum > 25;
              return (
                <Box key={cls} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{cls}</Typography>
                    <Typography variant="body2" sx={{ color: isOver ? '#ef4444' : palette.text }}>
                      {pctNum.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(pctNum, 100)}
                    sx={{
                      height: 8, borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': { bgcolor: isOver ? '#ef4444' : palette.accent },
                    }}
                  />
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Top recommendations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
              Top Recommendations
            </Typography>
            {activeRecs.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                No action items — portfolio looks good.
              </Typography>
            ) : (
              activeRecs.map((rec, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: palette.primary, minWidth: 20 }}>
                    {i + 1}.
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {rec.action} {rec.symbol}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {rec.rationale}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Position heatmap (simplified as grade cards) */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
              Position Heatmap
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {positions
                .sort((a, b) => Number(b.raw.current_value) - Number(a.raw.current_value))
                .map(pos => {
                  const cr = committeeResults.find(c => c.symbol === pos.raw.symbol);
                  const grade = cr?.consensus_grade || '—';
                  const color = GRADE_COLORS[grade] || '#94a3b8';
                  const value = Number(pos.raw.current_value);
                  const totalVal = Number(metrics.total_value);
                  const weight = totalVal > 0 ? value / totalVal : 0;
                  const size = Math.max(60, Math.min(140, weight * 1200));

                  return (
                    <Paper
                      key={pos.raw.symbol}
                      elevation={0}
                      sx={{
                        width: size, height: size * 0.7,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${color}15`, border: `1px solid ${color}40`,
                        borderRadius: 1, cursor: 'pointer',
                        '&:hover': { bgcolor: `${color}25` },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {pos.raw.symbol}
                      </Typography>
                      <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                        {grade}
                      </Typography>
                    </Paper>
                  );
                })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
