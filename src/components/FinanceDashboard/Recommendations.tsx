import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { palette } from '../../theme';
import type { Alert, Recommendation } from '../../api/finance';

const ACTION_COLORS: Record<string, string> = {
  BUY: '#16a34a', HOLD: '#64748b', TRIM: '#eab308', SELL: '#ef4444', WATCH: '#06b6d4',
};

const CONFIDENCE_COLORS: Record<string, 'error' | 'warning' | 'info'> = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'info',
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

interface Props {
  recommendations: Recommendation[];
  alerts: Alert[];
}

export default function Recommendations({ recommendations, alerts }: Props) {
  const actionRecs = recommendations.filter(r => r.action !== 'HOLD');

  return (
    <Box>
      {/* Alerts section */}
      {alerts.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
            Alerts
          </Typography>
          {alerts.map((alert, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2, mb: 1.5,
                bgcolor: alert.severity === 'CRITICAL' ? '#fef2f2' : alert.severity === 'WARNING' ? '#fffbeb' : '#eff6ff',
                border: `1px solid ${alert.severity === 'CRITICAL' ? '#fecaca' : alert.severity === 'WARNING' ? '#fef3c7' : '#bfdbfe'}`,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  bgcolor: SEVERITY_COLORS[alert.severity],
                }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {alert.severity}
                </Typography>
                {alert.affected_symbols.length > 0 && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    ({alert.affected_symbols.join(', ')})
                  </Typography>
                )}
              </Box>
              <Typography variant="body2">{alert.message}</Typography>
            </Paper>
          ))}
        </Paper>
      )}

      {/* Prioritized recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
          Recommendations ({actionRecs.length} action items)
        </Typography>

        {actionRecs.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            No action required — all positions are within targets.
          </Typography>
        ) : (
          actionRecs.map((rec, i) => (
            <Paper
              key={`${rec.symbol}-${i}`}
              elevation={0}
              sx={{
                p: 2.5, mb: 2,
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${ACTION_COLORS[rec.action] || '#94a3b8'}`,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: palette.primary, minWidth: 24 }}>
                  {i + 1}.
                </Typography>
                <Chip
                  label={rec.action}
                  size="small"
                  sx={{
                    bgcolor: `${ACTION_COLORS[rec.action]}15`,
                    color: ACTION_COLORS[rec.action],
                    fontWeight: 700,
                    border: `1px solid ${ACTION_COLORS[rec.action]}40`,
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {rec.symbol}
                </Typography>
                <Chip
                  label={rec.confidence}
                  size="small"
                  color={CONFIDENCE_COLORS[rec.confidence] || 'default'}
                  variant="outlined"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: palette.text, pl: 4.5 }}>
                {rec.rationale}
              </Typography>
              {rec.sizing_guidance && (
                <Typography variant="caption" sx={{ color: '#64748b', pl: 4.5, display: 'block', mt: 0.5 }}>
                  Sizing: {rec.sizing_guidance}
                </Typography>
              )}
            </Paper>
          ))
        )}
      </Paper>
    </Box>
  );
}
