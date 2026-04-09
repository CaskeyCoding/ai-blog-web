import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Container, Typography, Box, Paper, Button, Stack, TextField,
  Chip, Skeleton, Alert, MenuItem, Select, InputLabel, FormControl,
  FormControlLabel, Switch, Divider, LinearProgress, Collapse,
  SelectChangeEvent, IconButton, Avatar, CircularProgress,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SportsIcon from '@mui/icons-material/Sports';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import {
  getProfile, saveProfile, getMetrics, requestRecommendation,
  submitActivity, submitRecovery, importCsv, sendChatMessage,
  type AthleteProfile, type MetricsResponse, type RecommendationResponse,
  type CsvImportResult, type ChatMessage,
} from '../api/coach';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { palette } from '../theme';

const WORKOUT_TYPES = [
  { value: 'easy_run', label: 'Easy Run' },
  { value: 'long_run', label: 'Long Run' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'intervals', label: 'Intervals' },
  { value: 'hills', label: 'Hills' },
  { value: 'recovery_run', label: 'Recovery Run' },
  { value: 'race', label: 'Race' },
];

const SEVERITY_COLORS: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  informational: 'info',
  caution: 'warning',
  warning: 'warning',
  critical: 'error',
};

function acwrColor(acwr: number | null): string {
  if (acwr === null) return '#9e9e9e';
  if (acwr < 0.8) return '#2196f3';
  if (acwr <= 1.3) return '#4caf50';
  if (acwr <= 1.5) return '#ff9800';
  return '#d32f2f';
}

function acwrLabel(acwr: number | null): string {
  if (acwr === null) return 'N/A';
  if (acwr < 0.8) return 'Under-training';
  if (acwr <= 1.3) return 'Sweet spot';
  if (acwr <= 1.5) return 'Elevated risk';
  return 'Danger zone';
}

function recommendationColor(type: string): string {
  const colors: Record<string, string> = {
    PROCEED_AS_PLANNED: '#4caf50',
    REDUCE_INTENSITY: '#ff9800',
    SHORTEN_WORKOUT: '#ff9800',
    SUBSTITUTE_RECOVERY: '#f57c00',
    CROSS_TRAIN_OR_REST: '#ef5350',
    FULL_REST: '#d32f2f',
    NEEDS_MORE_DATA: '#9e9e9e',
  };
  return colors[type] || '#9e9e9e';
}

function recommendationLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({ label, value, unit, icon }: {
  label: string; value: string | number; unit?: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Stack>
      <Typography variant="h5" fontWeight={700} color={palette.primary}>
        {value}{unit && <Typography component="span" variant="body2" color="text.secondary"> {unit}</Typography>}
      </Typography>
    </Paper>
  );
}

function AcwrGauge({ acwr }: { acwr: number | null }) {
  const pct = acwr !== null ? Math.min((acwr / 2.0) * 100, 100) : 0;
  return (
    <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <TrendingUpIcon sx={{ color: acwrColor(acwr), fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">ACWR</Typography>
      </Stack>
      <Typography variant="h5" fontWeight={700} sx={{ color: acwrColor(acwr) }}>
        {acwr !== null ? acwr.toFixed(2) : '—'}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mt: 1, height: 8, borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': { backgroundColor: acwrColor(acwr), borderRadius: 4 },
        }}
      />
      <Typography variant="caption" sx={{ color: acwrColor(acwr), mt: 0.5, display: 'block' }}>
        {acwrLabel(acwr)}
      </Typography>
    </Paper>
  );
}

function GuardrailChip({ rule_name, severity }: { rule_name: string; severity: string }) {
  return (
    <Chip
      size="small"
      label={rule_name.replace(/_/g, ' ')}
      color={SEVERITY_COLORS[severity] || 'default'}
      variant="outlined"
      icon={severity === 'critical' ? <WarningAmberIcon /> : undefined}
    />
  );
}

// ---------------------------------------------------------------------------
// Section: Garmin CSV Import (onboarding)
// ---------------------------------------------------------------------------

function GarminImport({ onImported }: {
  onImported: (result: CsvImportResult) => void;
}) {
  const [name, setName] = useState('');
  const [goalRace, setGoalRace] = useState('');
  const [goalRaceDate, setGoalRaceDate] = useState('');
  const [goalTime, setGoalTime] = useState('');
  const [maxHr, setMaxHr] = useState('185');
  const [restHr, setRestHr] = useState('');
  const [injuries, setInjuries] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCsvFile(file);
  };

  const handleImport = async () => {
    if (!csvFile) { setError('Select your Garmin CSV file'); return; }
    if (!name.trim()) { setError('Name is required'); return; }
    setImporting(true);
    setError('');
    try {
      const csvText = await csvFile.text();
      const result = await importCsv(csvText, {
        name: name.trim(),
        max_heart_rate: maxHr ? Number(maxHr) : 185,
        goal_race: goalRace || undefined,
        goal_race_date: goalRaceDate || undefined,
        goal_time: goalTime || undefined,
        baseline_resting_hr: restHr ? Number(restHr) : undefined,
        injury_history: injuries ? injuries.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      onImported(result);
    } catch {
      setError('Failed to import CSV. Check the file format and try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
      <UploadFileIcon sx={{ fontSize: 48, color: palette.accent, mb: 2 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: palette.primary }}>
        Welcome to Marathon Coach
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        Upload your Garmin CSV export to get started. We'll import your training history
        and create your profile automatically.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          {csvFile ? csvFile.name : 'Choose Activities.csv'}
          <input type="file" accept=".csv" hidden onChange={handleFileChange} />
        </Button>

        <Divider>Profile Info</Divider>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Your Name" value={name} onChange={e => setName(e.target.value)} required fullWidth size="small" />
          <TextField label="Max Heart Rate" type="number" value={maxHr} onChange={e => setMaxHr(e.target.value)} fullWidth size="small" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Goal Race" value={goalRace} onChange={e => setGoalRace(e.target.value)} fullWidth size="small" placeholder="e.g. 2026 TCS NYC Marathon" />
          <TextField label="Goal Time" value={goalTime} onChange={e => setGoalTime(e.target.value)} fullWidth size="small" placeholder="e.g. 3:45:00" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Goal Race Date" type="date" value={goalRaceDate} onChange={e => setGoalRaceDate(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Resting Heart Rate" type="number" value={restHr} onChange={e => setRestHr(e.target.value)} fullWidth size="small" />
        </Stack>
        <TextField label="Injury History" value={injuries} onChange={e => setInjuries(e.target.value)} fullWidth size="small" placeholder="Comma-separated, e.g. calf tightness — left (March 2026)" />

        <Button
          variant="contained"
          onClick={handleImport}
          disabled={importing || !csvFile}
          size="large"
          sx={{ backgroundColor: palette.accent, color: '#fff', fontWeight: 700, '&:hover': { backgroundColor: '#d4900e' } }}
        >
          {importing ? 'Importing activities…' : 'Import & Get Started'}
        </Button>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Section: Profile Setup
// ---------------------------------------------------------------------------

function ProfileSetup({ profile, onSaved }: {
  profile: AthleteProfile | null;
  onSaved: (p: AthleteProfile) => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [goalRace, setGoalRace] = useState(profile?.goal_race || '');
  const [goalRaceDate, setGoalRaceDate] = useState(profile?.goal_race_date || '');
  const [goalTime, setGoalTime] = useState(profile?.goal_time || '');
  const [maxHr, setMaxHr] = useState(profile?.max_heart_rate?.toString() || '');
  const [restHr, setRestHr] = useState(profile?.baseline_resting_hr?.toString() || '');
  const [injuries, setInjuries] = useState(profile?.injury_history?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const p = await saveProfile({
        name: name.trim(),
        goal_race: goalRace || undefined,
        goal_race_date: goalRaceDate || undefined,
        goal_time: goalTime || undefined,
        max_heart_rate: maxHr ? Number(maxHr) : undefined,
        baseline_resting_hr: restHr ? Number(restHr) : undefined,
        injury_history: injuries ? injuries.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      onSaved(p);
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: palette.primary }}>
        <DirectionsRunIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Athlete Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required fullWidth size="small" />
          <TextField label="Goal Race" value={goalRace} onChange={e => setGoalRace(e.target.value)} fullWidth size="small" placeholder="e.g. 2026 TCS NYC Marathon" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Goal Race Date" type="date" value={goalRaceDate} onChange={e => setGoalRaceDate(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Goal Time" value={goalTime} onChange={e => setGoalTime(e.target.value)} fullWidth size="small" placeholder="e.g. 3:45:00" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Max Heart Rate" type="number" value={maxHr} onChange={e => setMaxHr(e.target.value)} fullWidth size="small" />
          <TextField label="Resting Heart Rate" type="number" value={restHr} onChange={e => setRestHr(e.target.value)} fullWidth size="small" />
        </Stack>
        <TextField label="Injury History" value={injuries} onChange={e => setInjuries(e.target.value)} fullWidth size="small" placeholder="Comma-separated, e.g. calf tightness — left (March 2026)" />
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ alignSelf: 'flex-start', backgroundColor: palette.primary, '&:hover': { backgroundColor: '#004080' } }}>
          {saving ? 'Saving…' : (profile ? 'Update Profile' : 'Create Profile')}
        </Button>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Section: Recovery Check-in
// ---------------------------------------------------------------------------

function RecoveryCheckin({ onSubmitted }: { onSubmitted: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [restHr, setRestHr] = useState('');
  const [sleep, setSleep] = useState('');
  const [readiness, setReadiness] = useState('');
  const [energy, setEnergy] = useState('');
  const [soreness, setSoreness] = useState('');
  const [painFlag, setPainFlag] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await submitRecovery({
        date: today,
        resting_heart_rate: restHr ? Number(restHr) : undefined,
        sleep_duration_hours: sleep ? Number(sleep) : undefined,
        readiness_score: readiness ? Number(readiness) : undefined,
        subjective_energy: energy ? Number(energy) : undefined,
        subjective_soreness: soreness ? Number(soreness) : undefined,
        pain_flag: painFlag,
        pain_location: painFlag ? painLocation : undefined,
        notes: notes || undefined,
      });
      setSuccess(true);
      onSubmitted();
    } catch {
      // error already shown via Alert
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: palette.primary }}>
        <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#e91e63' }} />
        Today's Recovery Check-in
      </Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>Recovery snapshot saved.</Alert>}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Resting HR (bpm)" type="number" value={restHr} onChange={e => setRestHr(e.target.value)} fullWidth size="small" />
          <TextField label="Sleep (hours)" type="number" value={sleep} onChange={e => setSleep(e.target.value)} fullWidth size="small" inputProps={{ step: 0.5 }} />
          <TextField label="Readiness (0–100)" type="number" value={readiness} onChange={e => setReadiness(e.target.value)} fullWidth size="small" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Energy (1–10)" type="number" value={energy} onChange={e => setEnergy(e.target.value)} fullWidth size="small" />
          <TextField label="Soreness (1–10)" type="number" value={soreness} onChange={e => setSoreness(e.target.value)} fullWidth size="small" />
        </Stack>
        <FormControlLabel control={<Switch checked={painFlag} onChange={e => setPainFlag(e.target.checked)} />} label="Pain flag" />
        <Collapse in={painFlag}>
          <TextField label="Pain location" value={painLocation} onChange={e => setPainLocation(e.target.value)} fullWidth size="small" placeholder="e.g. left calf" />
        </Collapse>
        <TextField label="Notes" value={notes} onChange={e => setNotes(e.target.value)} fullWidth size="small" multiline rows={2} />
        <Button variant="contained" onClick={handleSubmit} disabled={saving}
          sx={{ alignSelf: 'flex-start', backgroundColor: palette.primary, '&:hover': { backgroundColor: '#004080' } }}>
          {saving ? 'Saving…' : 'Submit Recovery'}
        </Button>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Section: Log Activity
// ---------------------------------------------------------------------------

function LogActivity({ onSubmitted }: { onSubmitted: () => void }) {
  const [actDate, setActDate] = useState(new Date().toISOString().slice(0, 10));
  const [workoutType, setWorkoutType] = useState('easy_run');
  const [distKm, setDistKm] = useState('');
  const [durMin, setDurMin] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!distKm || !durMin) { setError('Distance and duration are required'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await submitActivity({
        sport_type: 'running',
        workout_type: workoutType,
        date: actDate,
        duration_seconds: Math.round(Number(durMin) * 60),
        distance_km: Number(distKm),
        avg_heart_rate: avgHr ? Number(avgHr) : undefined,
      });
      setSuccess(true);
      setDistKm('');
      setDurMin('');
      setAvgHr('');
      onSubmitted();
    } catch {
      setError('Failed to submit activity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: palette.primary }}>
        <DirectionsRunIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Log Activity
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Activity saved.</Alert>}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Date" type="date" value={actDate} onChange={e => setActDate(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
          <FormControl fullWidth size="small">
            <InputLabel>Workout Type</InputLabel>
            <Select value={workoutType} label="Workout Type" onChange={(e: SelectChangeEvent) => setWorkoutType(e.target.value)}>
              {WORKOUT_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Distance (km)" type="number" value={distKm} onChange={e => setDistKm(e.target.value)} fullWidth size="small" required />
          <TextField label="Duration (minutes)" type="number" value={durMin} onChange={e => setDurMin(e.target.value)} fullWidth size="small" required />
          <TextField label="Avg HR (bpm)" type="number" value={avgHr} onChange={e => setAvgHr(e.target.value)} fullWidth size="small" />
        </Stack>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}
          sx={{ alignSelf: 'flex-start', backgroundColor: palette.primary, '&:hover': { backgroundColor: '#004080' } }}>
          {saving ? 'Saving…' : 'Log Activity'}
        </Button>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Section: Recommendation
// ---------------------------------------------------------------------------

function RecommendationPanel({ profile }: { profile: AthleteProfile | null }) {
  const [workoutType, setWorkoutType] = useState('');
  const [targetDist, setTargetDist] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState('');

  const handleRequest = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const planned = workoutType
        ? {
            workout_type: workoutType,
            target_distance_km: targetDist ? Number(targetDist) : undefined,
          }
        : undefined;
      const resp = await requestRecommendation(planned);
      setResult(resp);
    } catch {
      setError('Failed to get recommendation. Make sure you have logged some activities.');
    } finally {
      setLoading(false);
    }
  };

  const rec = result?.recommendation;
  const narr = result?.narrative;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: palette.primary }}>
        <SportsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Get Coaching Recommendation
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Planned Workout (optional)</InputLabel>
            <Select value={workoutType} label="Planned Workout (optional)" onChange={(e: SelectChangeEvent) => setWorkoutType(e.target.value)}>
              <MenuItem value="">None — general advice</MenuItem>
              {WORKOUT_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Target Distance (km)" type="number" value={targetDist} onChange={e => setTargetDist(e.target.value)} fullWidth size="small" />
        </Stack>
        <Button variant="contained" onClick={handleRequest} disabled={loading || !profile}
          sx={{ alignSelf: 'flex-start', backgroundColor: palette.accent, color: '#fff', fontWeight: 600, '&:hover': { backgroundColor: '#d4900e' } }}>
          {loading ? 'Analyzing…' : 'Ask Coach'}
        </Button>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rec && narr && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              label={recommendationLabel(rec.recommendation_type)}
              sx={{
                backgroundColor: recommendationColor(rec.recommendation_type),
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
            <Chip label={`Confidence: ${rec.confidence}`} variant="outlined" size="small" />
            {narr.is_fallback && <Chip label="Fallback" color="warning" size="small" />}
          </Stack>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Summary</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{narr.summary}</Typography>

          {narr.trend_analysis && (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Trend Analysis</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{narr.trend_analysis}</Typography>
            </>
          )}

          {narr.coaching_advice && (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Coaching Advice</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{narr.coaching_advice}</Typography>
            </>
          )}

          {narr.safety_notes && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>Safety Notes</Typography>
              <Typography variant="body2">{narr.safety_notes}</Typography>
            </Alert>
          )}

          {rec.guardrails_triggered.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Guardrails Triggered</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {rec.guardrails_triggered.map(g => (
                  <GuardrailChip key={g.rule_id} rule_name={g.rule_name} severity={g.severity} />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Section: Chat with Coach
// ---------------------------------------------------------------------------

const QUICK_PROMPTS = [
  'How is my training load looking?',
  'Am I ready for a long run this weekend?',
  'What should I focus on this week?',
  'How does my pace trend look?',
];

function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const resp = await sendChatMessage(text.trim(), history);
      const assistantMsg: ChatMessage = { role: 'assistant', content: resp.reply };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory(resp.conversation_history);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (!open) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: { xs: 'calc(100% - 48px)', sm: 420 },
        height: { xs: 'calc(100% - 120px)', sm: 560 },
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SmartToyIcon />
          <Typography variant="subtitle1" fontWeight={700}>Coach Chat</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1, overflowY: 'auto', p: 2,
        backgroundColor: '#fafafa',
        display: 'flex', flexDirection: 'column', gap: 1.5,
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: '#bbb', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ask me anything about your training!
            </Typography>
            <Stack spacing={1}>
              {QUICK_PROMPTS.map(q => (
                <Button
                  key={q}
                  size="small"
                  variant="outlined"
                  onClick={() => send(q)}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#ddd',
                    color: 'text.secondary',
                    justifyContent: 'flex-start',
                    '&:hover': { borderColor: palette.accent, color: palette.accent },
                  }}
                >
                  {q}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
        {messages.map((msg, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar sx={{ width: 28, height: 28, bgcolor: palette.primary, mt: 0.5 }}>
                <SmartToyIcon sx={{ fontSize: 16 }} />
              </Avatar>
            )}
            <Paper
              elevation={0}
              sx={{
                px: 2, py: 1.25,
                borderRadius: 2.5,
                backgroundColor: msg.role === 'user' ? palette.primary : '#fff',
                color: msg.role === 'user' ? '#fff' : 'text.primary',
                border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </Paper>
            {msg.role === 'user' && (
              <Avatar sx={{ width: 28, height: 28, bgcolor: palette.accent, mt: 0.5 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
              </Avatar>
            )}
          </Stack>
        ))}
        {loading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: palette.primary }}>
              <SmartToyIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <CircularProgress size={18} sx={{ color: palette.primary }} />
            <Typography variant="caption" color="text.secondary">Thinking…</Typography>
          </Stack>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about your training…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            multiline
            maxRows={3}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            sx={{
              backgroundColor: palette.accent,
              color: '#fff',
              '&:hover': { backgroundColor: '#d4900e' },
              '&.Mui-disabled': { backgroundColor: '#eee' },
              borderRadius: 2,
              width: 40,
              height: 40,
              alignSelf: 'flex-end',
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function CoachDashboard() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState('');

  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const p = await getProfile();
      setProfile(p);
      setNeedsOnboarding(false);
      const m = await getMetrics();
      setMetricsData(m);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'PROFILE_NOT_FOUND') {
        setNeedsOnboarding(true);
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { document.title = 'Marathon Coach — caskeycoding.com'; }, []);

  const handleProfileSaved = (p: AthleteProfile) => {
    setProfile(p);
    setShowProfile(false);
    loadData();
  };

  const metrics = metricsData?.metrics;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width={300} height={48} />
        <Stack direction="row" spacing={2} sx={{ my: 3 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={200} height={100} />)}
        </Stack>
        <Skeleton variant="rounded" height={200} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '80vh' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color={palette.primary}>
              Marathon Coach
            </Typography>
            {profile && (
              <Typography variant="body2" color="text.secondary">
                {profile.goal_race ? `Training for ${profile.goal_race}` : `Welcome, ${profile.name}`}
                {profile.goal_time && ` · Goal: ${profile.goal_time}`}
              </Typography>
            )}
          </Box>
          {profile && (
            <Button size="small" variant="outlined" onClick={() => setShowProfile(!showProfile)}>
              {showProfile ? 'Hide Profile' : 'Edit Profile'}
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {importResult && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Imported <strong>{importResult.imported}</strong> activities
            {importResult.earliest_date && importResult.latest_date && (
              <> from {importResult.earliest_date} to {importResult.latest_date}</>
            )}.
            {importResult.skipped > 0 && <> ({importResult.skipped} skipped as duplicates or non-running.)</>}
          </Alert>
        )}

        {needsOnboarding && !profile && (
          <GarminImport onImported={(result) => {
            setImportResult(result);
            setProfile(result.profile);
            setNeedsOnboarding(false);
            loadData();
          }} />
        )}

        <Collapse in={showProfile && !!profile}>
          <ProfileSetup profile={profile} onSaved={handleProfileSaved} />
        </Collapse>

        {/* Metrics cards */}
        {metrics && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <AcwrGauge acwr={metrics.acwr} />
            <MetricCard
              label="Weekly Volume"
              value={metrics.weekly_volume_km.toFixed(1)}
              unit="km"
              icon={<DirectionsRunIcon sx={{ color: palette.primary, fontSize: 20 }} />}
            />
            <MetricCard
              label="Volume Change"
              value={metrics.volume_change_pct !== null ? `${metrics.volume_change_pct > 0 ? '+' : ''}${metrics.volume_change_pct.toFixed(1)}%` : '—'}
              icon={<TrendingUpIcon sx={{ color: metrics.volume_change_pct !== null && metrics.volume_change_pct > 10 ? '#ff9800' : '#4caf50', fontSize: 20 }} />}
            />
            <MetricCard
              label="Activities (14d)"
              value={metrics.total_activities_14d}
              icon={<CheckCircleOutlineIcon sx={{ color: '#4caf50', fontSize: 20 }} />}
            />
          </Box>
        )}

        {metrics && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <MetricCard
              label="Consecutive Hard Days"
              value={metrics.consecutive_hard_days}
              icon={<WarningAmberIcon sx={{ color: metrics.consecutive_hard_days >= 3 ? '#d32f2f' : '#9e9e9e', fontSize: 20 }} />}
            />
            <MetricCard
              label="Days Since Rest"
              value={metrics.days_since_rest}
              icon={<FavoriteIcon sx={{ color: metrics.days_since_rest >= 7 ? '#d32f2f' : '#e91e63', fontSize: 20 }} />}
            />
            <MetricCard
              label="Longest Run (7d)"
              value={metrics.longest_run_km_7d.toFixed(1)}
              unit="km"
              icon={<DirectionsRunIcon sx={{ color: palette.accent, fontSize: 20 }} />}
            />
            {metrics.monotony_7d !== null && (
              <MetricCard
                label="Monotony"
                value={metrics.monotony_7d.toFixed(2)}
                icon={<TrendingUpIcon sx={{ color: metrics.monotony_7d > 2.0 ? '#ff9800' : '#9e9e9e', fontSize: 20 }} />}
              />
            )}
          </Box>
        )}

        {metricsData?.latest_recovery && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f0f7ff' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Latest Recovery Snapshot</Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {metricsData.latest_recovery.resting_heart_rate && (
                <Typography variant="body2">HR: <strong>{metricsData.latest_recovery.resting_heart_rate} bpm</strong></Typography>
              )}
              {metricsData.latest_recovery.sleep_duration_hours && (
                <Typography variant="body2">Sleep: <strong>{metricsData.latest_recovery.sleep_duration_hours}h</strong></Typography>
              )}
              {metricsData.latest_recovery.readiness_score && (
                <Typography variant="body2">Readiness: <strong>{metricsData.latest_recovery.readiness_score}/100</strong></Typography>
              )}
              {metricsData.latest_recovery.subjective_energy && (
                <Typography variant="body2">Energy: <strong>{metricsData.latest_recovery.subjective_energy}/10</strong></Typography>
              )}
              {metricsData.latest_recovery.pain_flag && (
                <Chip size="small" label={`Pain: ${metricsData.latest_recovery.pain_location || 'yes'}`} color="error" />
              )}
            </Stack>
          </Paper>
        )}

        <RecommendationPanel profile={profile} />

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <RecoveryCheckin onSubmitted={loadData} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LogActivity onSubmitted={loadData} />
          </Box>
        </Stack>
      </Container>

      {/* Chat FAB + Panel */}
      {profile && !chatOpen && (
        <IconButton
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            backgroundColor: palette.accent,
            color: '#fff',
            boxShadow: 4,
            '&:hover': { backgroundColor: '#d4900e', transform: 'scale(1.05)' },
            transition: 'transform 0.2s',
            zIndex: 1200,
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </Box>
  );
}
