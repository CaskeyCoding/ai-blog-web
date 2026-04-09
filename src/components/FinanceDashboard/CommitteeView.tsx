import React, { useState } from 'react';
import {
  Box, Grid, Paper, Slider, Typography, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { palette } from '../../theme';
import type { CommitteeConsensus } from '../../api/finance';

const MEMBER_LABELS: Record<string, string> = {
  graham: 'Benjamin Graham',
  buffett: 'Warren Buffett',
  lynch: 'Peter Lynch',
  dalio: 'Ray Dalio',
  druckenmiller: 'Stanley Druckenmiller',
};

const MEMBER_PHILOSOPHY: Record<string, string> = {
  graham: 'Margin of safety, balance sheet strength, deep value',
  buffett: 'Quality compounders at fair prices, economic moats',
  lynch: 'Growth at a reasonable price, PEG ratio',
  dalio: 'All-weather allocation, risk parity, diversification',
  druckenmiller: 'Macro trends, momentum, best ideas',
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#16a34a', A: '#22c55e', 'B+': '#eab308', B: '#f59e0b',
  C: '#f97316', D: '#ef4444', F: '#dc2626',
};

const PRESETS: Record<string, Record<string, number>> = {
  balanced: { graham: 30, buffett: 25, lynch: 20, dalio: 15, druckenmiller: 10 },
  defensive: { graham: 40, buffett: 25, lynch: 10, dalio: 20, druckenmiller: 5 },
  aggressive: { graham: 15, buffett: 20, lynch: 30, dalio: 10, druckenmiller: 25 },
};

interface Props {
  committeeResults: CommitteeConsensus[];
}

export default function CommitteeView({ committeeResults }: Props) {
  const [preset, setPreset] = useState('balanced');
  const [weights, setWeights] = useState(PRESETS.balanced);

  const handlePreset = (value: string) => {
    setPreset(value);
    if (PRESETS[value]) {
      setWeights(PRESETS[value]);
    }
  };

  const handleWeightChange = (member: string, value: number) => {
    setPreset('custom');
    setWeights(prev => ({ ...prev, [member]: value }));
  };

  const members = ['graham', 'buffett', 'lynch', 'dalio', 'druckenmiller'];

  // Aggregate across all positions to get member averages
  const memberAverages: Record<string, { total: number; count: number }> = {};
  for (const cr of committeeResults) {
    for (const [name, ms] of Object.entries(cr.member_scores)) {
      if (!memberAverages[name]) memberAverages[name] = { total: 0, count: 0 };
      memberAverages[name].total += ms.score;
      memberAverages[name].count += 1;
    }
  }

  // Find biggest disagreements
  const disagreements = committeeResults
    .filter(cr => cr.disagreement_level === 'HIGH')
    .slice(0, 5);

  return (
    <Box>
      {/* Weight controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 600 }}>
            Investor Committee
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Preset</InputLabel>
            <Select value={preset} label="Preset" onChange={e => handlePreset(e.target.value)}>
              <MenuItem value="balanced">Balanced</MenuItem>
              <MenuItem value="defensive">Defensive</MenuItem>
              <MenuItem value="aggressive">Aggressive</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {members.map(member => {
            const avg = memberAverages[member];
            const avgScore = avg ? Math.round(avg.total / avg.count) : 0;
            return (
              <Grid key={member} size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {MEMBER_LABELS[member] || member}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primary }}>
                    {weights[member]}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                    Avg score: {avgScore}
                  </Typography>
                  <Slider
                    value={weights[member]}
                    onChange={(_, v) => handleWeightChange(member, v as number)}
                    min={0} max={50} step={5}
                    size="small"
                    sx={{ color: palette.accent }}
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    {MEMBER_PHILOSOPHY[member]}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Biggest disagreements */}
      {disagreements.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: palette.primary, mb: 2, fontWeight: 600 }}>
            Biggest Disagreements
          </Typography>
          {disagreements.map(cr => {
            const scores = Object.entries(cr.member_scores);
            const sorted = scores.sort((a, b) => b[1].score - a[1].score);
            const highest = sorted[0];
            const lowest = sorted[sorted.length - 1];

            return (
              <Paper key={cr.symbol} elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fffbeb', border: '1px solid #fef3c7' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {cr.symbol} — Spread: {highest[1].score - lowest[1].score} points
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {sorted.map(([name, ms]) => (
                    <Typography key={name} variant="caption">
                      <strong style={{ textTransform: 'capitalize' }}>{name}</strong>:{' '}
                      <span style={{ color: GRADE_COLORS[ms.grade] || palette.text }}>
                        {ms.grade} ({ms.score})
                      </span>
                    </Typography>
                  ))}
                </Box>
                {highest && lowest && (
                  <Typography variant="caption" sx={{ color: '#92400e', mt: 1, display: 'block' }}>
                    {highest[1].verdict}
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Paper>
      )}
    </Box>
  );
}
