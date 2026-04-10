import React, { useState, useCallback, useRef } from 'react';
import {
  Box, Paper, Typography, ToggleButtonGroup, ToggleButton, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  LinearProgress, Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { palette } from '../../theme';
import {
  generateIdealProfile,
  type FullReviewData,
  type IdealProfileData,
} from '../../api/finance';
import { GRADE_COLORS } from './gradeColors';

const BUCKET_LABELS: Record<string, string> = {
  DEFENSIVE_CORE: 'Defensive Core',
  GROWTH_CORE: 'Growth Core',
  INCOME: 'Income',
  SPECULATIVE_SLEEVE: 'Speculative',
  CASH: 'Cash',
};

const ACTION_CHIP: Record<string, { color: 'success' | 'error' | 'warning' | 'default' | 'info'; label: string }> = {
  SELL: { color: 'error', label: 'Sell' },
  TRIM: { color: 'warning', label: 'Trim' },
  ADD: { color: 'success', label: 'Add' },
  BUY: { color: 'success', label: 'Buy' },
  HOLD: { color: 'default', label: 'Hold' },
  WATCH: { color: 'info', label: 'Watch' },
};

interface Props {
  reviewData: FullReviewData;
}

export default function IdealProfile({ reviewData }: Props) {
  const [riskProfile, setRiskProfile] = useState<string>('moderate');
  const [profileData, setProfileData] = useState<IdealProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileRequestId = useRef(0);

  const handleProfileChange = useCallback(async (_: any, value: string | null) => {
    if (!value) return;
    const reqId = ++profileRequestId.current;
    setRiskProfile(value);
    setLoading(true);
    setError(null);
    try {
      const data = await generateIdealProfile(value, reviewData);
      if (reqId !== profileRequestId.current) return;
      setProfileData(data);
    } catch (err: any) {
      if (reqId !== profileRequestId.current) return;
      setError(err.message);
    } finally {
      if (reqId === profileRequestId.current) setLoading(false);
    }
  }, [reviewData]);

  // Auto-generate on first render if no data
  React.useEffect(() => {
    if (!profileData && !loading) {
      handleProfileChange(null, 'moderate');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !profileData) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ color: palette.primary }}>
          Building your ideal profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Risk profile selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
          Select Your Risk Profile
        </Typography>
        <ToggleButtonGroup
          value={riskProfile}
          exclusive
          disabled={loading}
          onChange={handleProfileChange}
          sx={{ mb: 1 }}
        >
          <ToggleButton value="conservative" sx={{ px: 3 }}>
            Conservative
          </ToggleButton>
          <ToggleButton value="moderate" sx={{ px: 3 }}>
            Moderate
          </ToggleButton>
          <ToggleButton value="aggressive" sx={{ px: 3 }}>
            Aggressive
          </ToggleButton>
        </ToggleButtonGroup>
        {profileData && (
          <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 1 }}>
            {profileData.profile_description}
          </Typography>
        )}
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {profileData && (
        <>
          {/* Projected improvement */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
              Projected Improvement
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <MetricCard
                label="Portfolio Grade"
                current={profileData.current_metrics.portfolio_grade}
                projected={profileData.projected_metrics.projected_grade}
                isGrade
              />
              <MetricCard
                label="Beta"
                current={profileData.current_metrics.weighted_beta.toFixed(2)}
                projected={profileData.projected_metrics.projected_beta.toFixed(2)}
              />
              <MetricCard
                label="Diversification"
                current={`${profileData.current_metrics.diversification_score}`}
                projected={`${profileData.projected_metrics.projected_diversification}`}
              />
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 0.5 }}>
                  Trades Required
                </Typography>
                <Typography variant="h5" sx={{ color: palette.primary, fontWeight: 700 }}>
                  {profileData.projected_metrics.trade_count}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.textSecondary }}>
                  ${Math.abs(profileData.projected_metrics.sell_total).toLocaleString()} trim/sell
                  {' / '}
                  ${profileData.projected_metrics.buy_total.toLocaleString()} add to existing
                </Typography>
                {profileData.projected_metrics.deployment_allocation_usd != null
                  && profileData.projected_metrics.deployment_allocation_usd > 0 && (
                  <Typography variant="caption" sx={{ color: '#16a34a', display: 'block', mt: 0.5 }}>
                    ~$
                    {profileData.projected_metrics.deployment_allocation_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    {' '}
                    to deploy into underweight buckets (see below)
                  </Typography>
                )}
              </Paper>
            </Box>
          </Paper>

          {/* Where to add capital */}
          {profileData.deployment_targets && profileData.deployment_targets.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LightbulbOutlinedIcon sx={{ color: palette.accent }} />
                <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700 }}>
                  Where to add capital (sectors and roles)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 2 }}>
                Your target mix is underweight in the buckets below. Use trims from over-concentrated names
                or new cash to build these sleeves — not an all-or-nothing sell list.
                For live ticker ideas with fundamentals, open the{' '}
                <strong>Suggestions</strong> tab.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profileData.deployment_targets.map((dt) => (
                  <Paper key={dt.bucket} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: palette.primary }}>
                      {BUCKET_LABELS[dt.bucket] || dt.bucket}
                      {' '}
                      <Typography component="span" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        (+${dt.target_add_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 0.5 }}>
                      {dt.rationale}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: palette.text }}>
                      Sectors / roles: {dt.sectors.join(', ')}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          )}

          {/* Allocation comparison */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
              Current vs. Target Allocation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(profileData.bucket_deltas).map(([bucket, delta]) => (
                <Box key={bucket}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {BUCKET_LABELS[bucket] || bucket}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: delta.delta_pct > 0.01 ? '#16a34a' : delta.delta_pct < -0.01 ? '#ef4444' : palette.textSecondary,
                      fontWeight: 600,
                    }}>
                      {delta.delta_pct > 0 ? '+' : ''}{(delta.delta_pct * 100).toFixed(1)}%
                      {' '}
                      ({delta.delta_dollars >= 0 ? '+' : ''}${delta.delta_dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ flex: 1, position: 'relative', height: 24, bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: `${Math.min(100, delta.current_pct * 100)}%`,
                        bgcolor: palette.primary, opacity: 0.3, borderRadius: 1,
                      }} />
                      <Box sx={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: `${Math.min(100, delta.target_pct * 100)}%`,
                        border: `2px dashed ${palette.primary}`, borderRadius: 1,
                        boxSizing: 'border-box',
                      }} />
                      <Box sx={{ position: 'absolute', top: 0, left: 4, height: '100%', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: palette.primary }}>
                          {(delta.current_pct * 100).toFixed(1)}% / {(delta.target_pct * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Rebalancing trades */}
          {profileData.trades.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
                <SwapHorizIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Rebalancing Trades
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Symbol</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profileData.trades.map((trade, i) => (
                      <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={trade.direction}
                            icon={trade.direction === 'BUY'
                              ? <TrendingUpIcon sx={{ fontSize: 16 }} />
                              : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                            color={trade.direction === 'BUY' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{trade.symbol}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${trade.dollar_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                            {trade.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Position rankings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700, mb: 2 }}>
              Position Rankings
            </Typography>
            <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 2 }}>
              All positions ranked by committee consensus score, with ideal actions for the{' '}
              <strong>{profileData.profile_label}</strong> profile.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Symbol</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Bucket</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Weight</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rationale</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profileData.ranked_positions.map((pos) => {
                    const chipDef = ACTION_CHIP[pos.ideal_action] || ACTION_CHIP.HOLD;
                    return (
                      <TableRow key={pos.symbol} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{pos.symbol}</TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{
                            px: 1, py: 0.25, borderRadius: 1,
                            bgcolor: palette.background, color: palette.textSecondary,
                          }}>
                            {BUCKET_LABELS[pos.bucket] || pos.bucket}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{pos.committee_score}</TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: GRADE_COLORS[pos.grade] || palette.text }}
                          >
                            {pos.grade}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{(pos.current_weight * 100).toFixed(1)}%</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={chipDef.label} color={chipDef.color} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: palette.textSecondary, maxWidth: 280 }}>
                            {pos.ideal_rationale}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}

function MetricCard({ label, current, projected, isGrade }: {
  label: string; current: string; projected: string; isGrade?: boolean;
}) {
  const improved = isGrade
    ? (GRADE_COLORS[projected] || '') !== (GRADE_COLORS[current] || '') && projected !== current
    : parseFloat(projected) !== parseFloat(current);

  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="h5"
          sx={{ color: palette.textSecondary, fontWeight: 500, textDecoration: improved ? 'line-through' : 'none' }}
        >
          {current}
        </Typography>
        {improved && (
          <>
            <Typography sx={{ color: palette.textSecondary }}>&rarr;</Typography>
            <Typography
              variant="h5"
              sx={{ color: isGrade ? (GRADE_COLORS[projected] || palette.primary) : '#16a34a', fontWeight: 700 }}
            >
              {projected}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
