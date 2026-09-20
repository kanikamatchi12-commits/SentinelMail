export type ThreatCategory =
  | 'Phishing'
  | 'Spoofing'
  | 'Business Email Compromise'
  | 'Malware Delivery'
  | 'Spam'
  | 'Suspicious'
  | 'Likely Safe'
  | 'Inconclusive'
  | 'BEC'
  | 'Safe';

export type CaseStatus = 'New' | 'Under Review' | 'Escalated' | 'Resolved' | 'False Positive';

export type RecommendedDisposition = 'Allow' | 'Review' | 'Quarantine' | 'Escalate' | 'Block';

export type GeoConfidence = 'High' | 'Moderate' | 'Low' | 'Insufficient data';

export interface KeyFinding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  why_it_matters: string;
  recommended_response: string;
}

export interface AuthenticationAssessmentRow {
  control: string;
  result: 'Pass' | 'Warning' | 'Fail' | 'Unavailable';
  evidence: string;
  interpretation: string;
  source?: string;
  alignment?: 'Aligned' | 'Misaligned' | 'N/A';
}

export interface RoutingHop {
  hop_index: number;
  ip: string;
  host?: string;
  by?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  delay_seconds?: number;
  timestamp?: string;
  time_delta?: string;
  anomalous: boolean;
  anomaly_reason?: string;
  is_private?: boolean;
  hop_type?: 'origin' | 'relay' | 'destination' | 'suspicious';
}

export interface ExtractedLink {
  url: string;
  domain: string;
  display_text?: string;
  is_redirect?: boolean;
  is_shortener?: boolean;
  flagged: boolean;
  reason?: string;
  disposition?: 'Safe' | 'Suspicious' | 'Malicious';
}

export interface ExtractedAttachment {
  filename: string;
  extension: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  has_double_extension: boolean;
  risk_flag: boolean;
  risk_reason?: string;
}

export interface IndicatorItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  status: 'pass' | 'fail' | 'warn' | 'neutral';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScoreBreakdownItem {
  category: string;
  max_points: number;
  assigned_points: number;
  indicator: string;
  evidence: string;
  severity: 'Low' | 'Needs Review' | 'Suspicious' | 'High' | 'Critical';
  explanation: string;
}

export interface ChainOfCustodyEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  previous_value?: string;
  updated_value?: string;
  hash: string;
  notes?: string;
  details?: string;
}

export interface ProbableOrigin {
  country: string;
  city?: string;
  ip: string;
  isp?: string;
  confidence: GeoConfidence;
  reason?: string;
  is_anomalous?: boolean;
}

export interface GeoAnomaly {
  observation: string;
  explanation: string;
  confidence: string;
  required_action: string;
}

export interface EmailAnalysis {
  id: string; // Format: SM-2026-XXXX
  case_number: string;
  title: string;
  analyst_name: string;
  status: CaseStatus;
  evidence_source?: 'Upload' | 'Pasted' | 'Sample';
  is_demo?: boolean;
  confidence_score: number;
  confidence_label: string;
  engine_type: 'AI-Assisted Assessment' | 'Heuristic Assessment';
  created_at: string;
  filename?: string;
  evidence_hash?: string;
  file_size?: number;
  evidence_type?: string;
  engine_version?: string;
  subject: string;
  from_address: string;
  from_name?: string;
  from_domain?: string;
  to_address: string;
  reply_to?: string;
  return_path?: string;
  message_id: string;
  date: string;
  raw_headers: string;
  body_text: string;
  body_html?: string;
  risk_score: number;
  threat_category: ThreatCategory;
  recommended_disposition?: RecommendedDisposition;
  analyst_notes?: string;
  ai_explanation: string;
  ai_explanation_simple: string;
  red_flags: string[];
  recommendations: string[];
  key_findings: KeyFinding[];
  auth_table: AuthenticationAssessmentRow[];
  authentication_assessment?: AuthenticationAssessmentRow[];
  spf_result: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none';
  dkim_result: 'pass' | 'fail' | 'none';
  dmarc_result: 'pass' | 'fail' | 'none';
  reply_to_mismatch: boolean;
  display_name_spoof: boolean;
  extracted_links: ExtractedLink[];
  links?: ExtractedLink[];
  extracted_attachments?: ExtractedAttachment[];
  routing_hops: RoutingHop[];
  indicators: IndicatorItem[];
  score_breakdown?: ScoreBreakdownItem[];
  chain_of_custody?: ChainOfCustodyEntry[];
  probable_origin_indicator?: ProbableOrigin;
  location_confidence?: GeoConfidence;
  geo_anomalies?: GeoAnomaly[];
  originating_country?: string;
  originating_ip?: string;
  executive_summary?: string;
  alert_generated?: boolean;
  alert_id?: string;
  alert_details?: ThreatAlert;
}

export interface ThreatAlert {
  id: string;
  case_id: string;
  title: string;
  severity: 'Informational' | 'Low' | 'Medium' | 'High' | 'Critical';
  threat_category: ThreatCategory;
  claimed_sender: string;
  sender_domain: string;
  subject: string;
  risk_score: number;
  probable_origin?: string;
  auth_failures: string[];
  primary_indicators: string[];
  recommended_action: string;
  analyst_notes: string;
  recipients: string[];
  created_at: string;
  status: 'Simulated' | 'Draft' | 'Sent' | 'Escalated';
  analyst_name: string;
}

export interface SampleEmailFixture {
  id: string;
  title: string;
  badge: string;
  type: ThreatCategory;
  risk_score: number;
  summary: string;
  filename: string;
  rawContent: string;
}
