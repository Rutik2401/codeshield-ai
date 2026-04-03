export interface ReviewResponse {
  summary: string;
  score: number;
  issues: Issue[];
  securityAudit: SecurityAudit;
  metrics: Metrics;
}

export interface Issue {
  id: string;
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  title: string;
  description: string;
  suggestion: string;
  fixedCode: string;
}

export interface SecurityAudit {
  vulnerabilities: Vulnerability[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  recommendations: string[];
}

export interface Vulnerability {
  owasp: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

export interface Metrics {
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface HistoryItem {
  id: string;
  code: string;
  language: string;
  review: ReviewResponse;
  createdAt: Date;
}
