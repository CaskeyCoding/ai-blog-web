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

export interface MemberScore {
  member_name: string;
  score: number;
  grade: string;
  verdict: string;
  rationale: Record<string, string>;
}

export interface CommitteeConsensus {
  symbol: string;
  member_scores: Record<string, MemberScore>;
  consensus_score: number;
  consensus_grade: string;
  disagreement_level: string;
  dissenting_opinions: string[];
}

export interface PortfolioMetrics {
  total_value: string;
  total_cost_basis: string;
  total_gain_loss: string;
  total_gain_loss_pct: string;
  weighted_beta: string;
  allocation_by_type: Record<string, string>;
  allocation_by_sector: Record<string, string>;
  allocation_by_classification: Record<string, string>;
  top_holdings: [string, string][];
  diversification_score: number;
}

export interface PositionData {
  raw: {
    symbol: string;
    description: string;
    quantity: string;
    last_price: string;
    current_value: string;
    cost_basis_total: string;
    gain_loss: string;
    gain_loss_pct: string;
    pct_of_account: string;
    asset_type: string;
  };
  market: {
    symbol: string;
    sector: string | null;
    beta: string | null;
    pe_ratio: string | null;
    roe: string | null;
    dividend_yield: string | null;
    analyst_rating: string | null;
  } | null;
  classification: string;
  degraded: boolean;
}

export interface Recommendation {
  symbol: string;
  action: string;
  confidence: string;
  rationale: string;
  sizing_guidance: string | null;
  priority: number;
}

export interface Alert {
  alert_type: string;
  severity: string;
  message: string;
  affected_symbols: string[];
  threshold: string;
  current_value: string;
}

export interface ReviewResult {
  portfolio_grade: string;
  total_value: string;
  recommendations_count: number;
  alerts_count: number;
  report: string | null;
}

export interface FullReviewData {
  review_id?: string;
  analyzed_at: string;
  portfolio_grade: string;
  metrics: PortfolioMetrics;
  positions: PositionData[];
  committee_results: CommitteeConsensus[];
  recommendations: Recommendation[];
  alerts: Alert[];
}

export interface ReviewSummary {
  review_id: string;
  created_at: string;
  portfolio_grade: string;
  total_value: string;
  position_count: number;
  alert_count: number;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function listReviews(): Promise<ReviewSummary[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/reviews`, { headers });
  if (!res.ok) throw new Error('Failed to load review history');
  const data = await res.json();
  return data.reviews;
}

export interface GapAnalysis {
  type: string;
  severity: string;
  title: string;
  description: string;
}

export interface StockSuggestion {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number | null;
  beta: number | null;
  price: number | null;
  pe_ratio: number | null;
  roe: number | null;
  dividend_yield: number | null;
  analyst_rating: string | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
  rationale: string;
  addresses_gap: string;
  projected_grade: string;
  grade_rationale: string;
}

export interface SuggestionsData {
  risk_profile: string;
  gap_analysis: GapAnalysis[];
  suggestions: StockSuggestion[];
  portfolio_grade: string;
  total_value: string;
}

export async function getSuggestions(
  reviewData: FullReviewData,
  riskProfile: string = 'moderate',
): Promise<SuggestionsData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/suggestions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      portfolio_data: {
        metrics: reviewData.metrics,
        positions: reviewData.positions,
        alerts: reviewData.alerts,
        portfolio_grade: reviewData.portfolio_grade,
      },
      risk_profile: riskProfile,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Suggestions request failed');
  }
  return res.json();
}

export async function triggerReview(csvKey: string): Promise<ReviewResult> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ csv_key: csvKey }),
  });
  if (!res.ok) throw new Error('Failed to trigger review');
  return res.json();
}

export async function getReviewStatus(): Promise<{ status: string; message: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/status`, { headers });
  if (!res.ok) throw new Error('Failed to get review status');
  return res.json();
}

export async function requestUploadUrl(): Promise<{ upload_url: string; csv_key: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/upload`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  return res.json();
}

export interface BucketDelta {
  current_pct: number;
  target_pct: number;
  delta_pct: number;
  current_dollars: number;
  target_dollars: number;
  delta_dollars: number;
}

export interface RankedPosition {
  symbol: string;
  description: string;
  bucket: string;
  current_value: number;
  current_weight: number;
  committee_score: number;
  grade: string;
  ideal_action: string;
  ideal_rationale: string;
  ideal_target_weight: number | null;
  delta_dollars: number;
}

export interface ProfileTrade {
  symbol: string;
  direction: 'BUY' | 'SELL';
  shares: number | null;
  dollar_amount: number;
  reason: string;
  from_bucket: string;
  priority: number;
}

export interface ProjectedMetrics {
  projected_grade: string;
  projected_beta: number;
  projected_diversification: number;
  sell_total: number;
  buy_total: number;
  net_cash_change: number;
  trade_count: number;
  deployment_allocation_usd?: number;
}

export interface DeploymentTarget {
  bucket: string;
  target_add_usd: number;
  delta_pct: number;
  sectors: string[];
  rationale: string;
}

export interface IdealProfileData {
  risk_profile: string;
  profile_label: string;
  profile_description: string;
  target_allocations: Record<string, number>;
  bucket_deltas: Record<string, BucketDelta>;
  deployment_targets: DeploymentTarget[];
  ranked_positions: RankedPosition[];
  trades: ProfileTrade[];
  projected_metrics: ProjectedMetrics;
  current_metrics: {
    portfolio_grade: string;
    weighted_beta: number;
    diversification_score: number;
    total_value: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateIdealProfile(
  riskProfile: string,
  reviewData: FullReviewData,
): Promise<IdealProfileData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      risk_profile: riskProfile,
      review_data: {
        positions: reviewData.positions,
        committee_results: reviewData.committee_results,
        metrics: reviewData.metrics,
        portfolio_grade: reviewData.portfolio_grade,
        analyzed_at: reviewData.analyzed_at,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Profile generation failed');
  }
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  portfolioContext: FullReviewData,
): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/finance/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      history,
      portfolio_context: portfolioContext,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Chat request failed');
  }
  const data = await res.json();
  return data.reply;
}
