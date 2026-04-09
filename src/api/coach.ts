import { API_CONFIG } from '../config';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = API_CONFIG.API_URL;

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('No authentication token available');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Pace {
  minutes_per_km: number;
}

export interface PaceRange {
  min_pace: Pace;
  max_pace: Pace;
}

export interface AthleteProfile {
  athlete_id: string;
  name: string;
  goal_race?: string;
  goal_race_date?: string;
  goal_time?: string;
  baseline_resting_hr?: number;
  baseline_hrv?: number;
  max_heart_rate?: number;
  easy_pace_range?: PaceRange;
  weekly_schedule?: Record<string, string>;
  injury_history: string[];
  preferences: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingMetrics {
  athlete_id: string;
  computed_date: string;
  acute_load_7d: number;
  chronic_load_28d: number;
  acwr: number | null;
  weekly_volume_km: number;
  previous_week_volume_km: number | null;
  volume_change_pct: number | null;
  monotony_7d: number | null;
  strain_7d: number | null;
  consecutive_hard_days: number;
  days_since_rest: number;
  longest_run_km_7d: number;
  total_activities_14d: number;
}

export interface GuardrailResult {
  rule_id: string;
  rule_name: string;
  severity: 'informational' | 'caution' | 'warning' | 'critical';
  triggered: boolean;
  message: string;
  metric_value: number | null;
  threshold: number | null;
}

export interface RecoverySnapshot {
  snapshot_id: string;
  athlete_id: string;
  date: string;
  resting_heart_rate?: number;
  hrv_ms?: number;
  sleep_duration_hours?: number;
  sleep_score?: number;
  readiness_score?: number;
  body_battery?: number;
  stress_level?: number;
  subjective_energy?: number;
  subjective_soreness?: number;
  pain_flag: boolean;
  pain_location?: string;
  notes?: string;
}

export interface CoachingNarrative {
  recommendation_id: string;
  summary: string;
  trend_analysis: string;
  coaching_advice: string;
  safety_notes: string | null;
  confidence_acknowledgment: string | null;
  is_fallback: boolean;
  model_id: string | null;
}

export interface Recommendation {
  recommendation_id: string;
  athlete_id: string;
  date: string;
  recommendation_type: string;
  guardrails_triggered: GuardrailResult[];
  metrics_snapshot: TrainingMetrics;
  recovery_snapshot: RecoverySnapshot | null;
  confidence: string;
  created_at?: string;
}

export interface RecommendationResponse {
  recommendation: Recommendation;
  narrative: CoachingNarrative;
}

export interface MetricsResponse {
  metrics: TrainingMetrics;
  latest_recovery: RecoverySnapshot | null;
  activity_count_14d: number;
  last_activity_date: string | null;
}

export interface ActivitySummary {
  activity_id: string;
  athlete_id: string;
  sport_type: string;
  workout_type?: string;
  date: string;
  duration_seconds: number;
  distance_km: number;
  avg_pace?: Pace;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  elevation_gain_m?: number;
  calories?: number;
  source: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<AthleteProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/profile`, { headers });
  if (!res.ok) {
    if (res.status === 404) throw new Error('PROFILE_NOT_FOUND');
    throw new Error('Failed to get profile');
  }
  return res.json();
}

export async function saveProfile(profile: Partial<AthleteProfile>): Promise<AthleteProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/metrics`, { headers });
  if (!res.ok) throw new Error('Failed to get metrics');
  return res.json();
}

export async function requestRecommendation(
  plannedWorkout?: { workout_type: string; target_distance_km?: number; target_duration_minutes?: number },
): Promise<RecommendationResponse> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {};
  if (plannedWorkout) body.planned_workout = plannedWorkout;
  const res = await fetch(`${API_URL}/coach/recommend`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to get recommendation');
  return res.json();
}

export async function submitActivity(activity: {
  sport_type: string;
  date: string;
  duration_seconds: number;
  distance_km: number;
  workout_type?: string;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  elevation_gain_m?: number;
  notes?: string;
}): Promise<ActivitySummary> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/activities`, {
    method: 'POST',
    headers,
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error('Failed to submit activity');
  return res.json();
}

export async function submitRecovery(snapshot: {
  date: string;
  resting_heart_rate?: number;
  hrv_ms?: number;
  sleep_duration_hours?: number;
  sleep_score?: number;
  readiness_score?: number;
  subjective_energy?: number;
  subjective_soreness?: number;
  pain_flag?: boolean;
  pain_location?: string;
  notes?: string;
}): Promise<RecoverySnapshot> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/recovery`, {
    method: 'POST',
    headers,
    body: JSON.stringify(snapshot),
  });
  if (!res.ok) throw new Error('Failed to submit recovery');
  return res.json();
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
  earliest_date: string | null;
  latest_date: string | null;
  profile: AthleteProfile;
}

export async function importCsv(
  csvText: string,
  profileInfo?: {
    name?: string;
    max_heart_rate?: number;
    goal_race?: string;
    goal_race_date?: string;
    goal_time?: string;
    baseline_resting_hr?: number;
    injury_history?: string[];
  },
): Promise<CsvImportResult> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/activities/import-csv`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ csv: csvText, ...profileInfo }),
  });
  if (!res.ok) throw new Error('Failed to import CSV');
  return res.json();
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  conversation_history: ChatMessage[];
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
): Promise<ChatResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/coach/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversation_history: conversationHistory }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function getRecommendations(
  from?: string,
  to?: string,
  limit?: number,
): Promise<{ recommendations: RecommendationResponse[]; count: number }> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_URL}/coach/recommendations${qs}`, { headers });
  if (!res.ok) throw new Error('Failed to get recommendations');
  return res.json();
}
