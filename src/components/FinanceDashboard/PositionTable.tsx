import React, { useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, Typography, Collapse, IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { palette } from '../../theme';
import type { CommitteeConsensus, PositionData, Recommendation } from '../../api/finance';
import { GRADE_COLORS } from './gradeColors';

const ACTION_COLORS: Record<string, string> = {
  BUY: '#16a34a', HOLD: '#64748b', TRIM: '#eab308', SELL: '#ef4444', WATCH: '#06b6d4',
};

type SortKey = 'symbol' | 'value' | 'pct' | 'grade' | 'gl' | 'action';

interface Props {
  positions: PositionData[];
  committeeResults: CommitteeConsensus[];
  recommendations: Recommendation[];
}

export default function PositionTable({ positions, committeeResults, recommendations }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const recMap = Object.fromEntries(recommendations.map(r => [r.symbol, r]));
  const crMap = Object.fromEntries(committeeResults.map(c => [c.symbol, c]));

  const totalValue = positions.reduce((s, p) => s + Number(p.raw.current_value), 0) || 1;

  const sorted = [...positions].sort((a, b) => {
    let av: number, bv: number;
    const aGrade = crMap[a.raw.symbol]?.consensus_score ?? 0;
    const bGrade = crMap[b.raw.symbol]?.consensus_score ?? 0;
    switch (sortBy) {
      case 'symbol': return sortDir === 'asc' ? a.raw.symbol.localeCompare(b.raw.symbol) : b.raw.symbol.localeCompare(a.raw.symbol);
      case 'value': av = Number(a.raw.current_value); bv = Number(b.raw.current_value); break;
      case 'pct': av = Number(a.raw.current_value) / totalValue; bv = Number(b.raw.current_value) / totalValue; break;
      case 'grade': av = aGrade; bv = bGrade; break;
      case 'gl': av = Number(a.raw.gain_loss_pct); bv = Number(b.raw.gain_loss_pct); break;
      case 'action': av = recMap[a.raw.symbol]?.priority ?? 99; bv = recMap[b.raw.symbol]?.priority ?? 99; break;
      default: av = 0; bv = 0;
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell><TableSortLabel active={sortBy === 'symbol'} direction={sortDir} onClick={() => handleSort('symbol')}>Symbol</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortBy === 'value'} direction={sortDir} onClick={() => handleSort('value')}>Value</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortBy === 'pct'} direction={sortDir} onClick={() => handleSort('pct')}>% Port</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortBy === 'grade'} direction={sortDir} onClick={() => handleSort('grade')}>Grade</TableSortLabel></TableCell>
            <TableCell align="right"><TableSortLabel active={sortBy === 'gl'} direction={sortDir} onClick={() => handleSort('gl')}>G/L %</TableSortLabel></TableCell>
            <TableCell><TableSortLabel active={sortBy === 'action'} direction={sortDir} onClick={() => handleSort('action')}>Action</TableSortLabel></TableCell>
            <TableCell>Classification</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map(pos => {
            const sym = pos.raw.symbol;
            const cr = crMap[sym];
            const rec = recMap[sym];
            const grade = cr?.consensus_grade || '—';
            const glPct = Number(pos.raw.gain_loss_pct) * 100;
            const expanded = expandedRow === sym;

            return (
              <React.Fragment key={sym}>
                <TableRow hover sx={{ '& > *': { borderBottom: expanded ? 'none' : undefined } }}>
                  <TableCell sx={{ width: 40 }}>
                    <IconButton size="small" onClick={() => setExpandedRow(expanded ? null : sym)}>
                      {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{sym}</TableCell>
                  <TableCell align="right">${Number(pos.raw.current_value).toLocaleString()}</TableCell>
                  <TableCell align="right">{(Number(pos.raw.current_value) / totalValue * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: GRADE_COLORS[grade] || palette.text, fontWeight: 700 }}>
                      {grade}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ color: glPct >= 0 ? '#16a34a' : '#ef4444' }}>
                    {glPct >= 0 ? '+' : ''}{glPct.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: ACTION_COLORS[rec?.action || ''] || palette.text, fontWeight: 600 }}>
                      {rec?.action || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {pos.classification}
                    </Typography>
                  </TableCell>
                </TableRow>

                {/* Expanded detail */}
                <TableRow>
                  <TableCell sx={{ py: 0 }} colSpan={8}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {cr && Object.entries(cr.member_scores).map(([name, ms]) => (
                          <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mr: 3, mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                              {name}:
                            </Typography>
                            <Typography variant="caption" sx={{ color: GRADE_COLORS[ms.grade] || palette.text }}>
                              {ms.score} ({ms.grade})
                            </Typography>
                          </Box>
                        ))}
                        {rec && rec.action !== 'HOLD' && (
                          <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                            {rec.rationale}
                          </Typography>
                        )}
                        {pos.market && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {pos.market.pe_ratio && <Typography variant="caption">P/E: {Number(pos.market.pe_ratio).toFixed(1)}</Typography>}
                            {pos.market.beta && <Typography variant="caption">Beta: {Number(pos.market.beta).toFixed(2)}</Typography>}
                            {pos.market.roe && <Typography variant="caption">ROE: {(Number(pos.market.roe) * 100).toFixed(1)}%</Typography>}
                            {pos.market.sector && <Typography variant="caption">Sector: {pos.market.sector}</Typography>}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
