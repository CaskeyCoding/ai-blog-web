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
  analyzed_at: string;
  portfolio_grade: string;
  metrics: PortfolioMetrics;
  positions: PositionData[];
  committee_results: CommitteeConsensus[];
  recommendations: Recommendation[];
  alerts: Alert[];
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

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
