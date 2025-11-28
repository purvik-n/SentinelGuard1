
export enum RiskLevel {
  LOW = 'LOW',         // 0-30
  MEDIUM = 'MEDIUM',   // 31-70
  HIGH = 'HIGH',       // 71-89
  CRITICAL = 'CRITICAL' // 90-100
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
  CHALLENGED = 'CHALLENGED', // e.g. MFA Prompted
  BLOCKED = 'BLOCKED'
}

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole; // This is the data model role, separate from the UI view role
  department: string;
}

export interface RiskHistoryPoint {
    date: string;
    score: number;
}

export interface TrustedDevice {
    id: string;
    name: string; // e.g., "Chrome on MacOS"
    type: 'DESKTOP' | 'MOBILE';
    os: string;
    lastUsed: string;
    status: 'TRUSTED' | 'REVOKED' | 'UNTRUSTED';
    fingerprint: string;
    firstSeen: string;
}

export interface UserAnomaly {
    id: string;
    timestamp: string;
    riskScore: number;
    reasons: string[];
    action: string;
}

export interface UserStats {
    userId: string;
    currentRiskLevel: RiskLevel;
    logins7d: number;
    logins30d: number;
    highRiskRate: number; // percentage
    trustedDevices: number;
    lastLogin: string;
    lastLocation: string;
    tags: string[]; // e.g., "Mostly India logins"
    riskHistory: RiskHistoryPoint[];
    accountStatus: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
    
    // New Behavioral Data
    behaviorProfile: {
        usualLocations: string[];
        usualDevices: string[];
        typingSpeedAvg: number;
        typingVarianceLabel: 'Consistent' | 'Erratic' | 'Bot-like';
        activityHeatmap: number[][]; // 7 days x 24 hours (0-10 intensity)
    };
    
    // Detailed Biometric Baselines
    avgErrorRate?: number; // % (Backspaces / Total Keys)
    avgFormTime?: number; // Seconds to complete login
    pasteFrequency?: number; // % of sensitive fields pasted

    recentAnomalies: UserAnomaly[];
    devices: TrustedDevice[];
}

export interface BehavioralMetrics {
  typingSpeed: number; // WPM
  typingVariance: number; // 0.0 - 1.0 (Low variance = bot)
  mouseVelocity: number; // avg px/s
  clickRate: number; // clicks per minute
}

export interface SessionHistoryEvent {
    id: string;
    timestamp: string;
    type: 'NAVIGATION' | 'ACTION' | 'ANOMALY' | 'SYSTEM';
    description: string;
    riskScore: number; // 0-100
    details?: string;
}

export interface Session {
  id: string;
  user: User;
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  startedAt: string;
  lastActive: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: SessionStatus;
  riskFactors: string[]; // e.g., ["Impossible Travel", "Tor Exit Node"]
  behavioralData: BehavioralMetrics;
  eventHistory: SessionHistoryEvent[]; // New: Session Flow
  aiAnalysis?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'MFA_CHALLENGE' | 'LOGOUT' | 'API_ACCESS' | 'SESSION_TERMINATED' | 'SENSITIVE_CHANGE';
  user: User;
  riskLevel: RiskLevel;
  riskScore: number;
  action: 'ALLOWED' | 'BLOCKED' | 'MFA_REQ' | 'LOCKED';
  source: 'WEB' | 'MOBILE' | 'API';
  location: string;
  ip: string;
  device: string;
  riskFactors?: string[];
  
  // New fields for Detail Drawer
  riskBreakdown?: { reason: string; score: number }[];
  isFalsePositive?: boolean;
  reviewed?: boolean;
}

export interface SystemStats {
  activeSessions: number;
  avgRiskScore: number;
  blockedAttacks24h: number;
  compromisedAccounts: number;
  totalLogins24h: number; // New
  highRiskLogins24h: number; // New
  accountsLocked: number; // New
}

export interface GeoLocation {
    lat: number;
    lng: number;
    risk: RiskLevel;
    location: string;
}

// Policy Types
export interface PolicyCondition {
    field: 'RISK_SCORE' | 'LOCATION' | 'DEVICE' | 'TIME' | 'BEHAVIOR' | 'IP_REP';
    operator: 'GT' | 'LT' | 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';
    value: string | number;
}

export interface PolicyAction {
    type: 'BLOCK' | 'MFA' | 'NOTIFY_ADMIN' | 'LOCK_ACCOUNT' | 'LOG_ONLY' | 'TERMINATE_SESSION' | 'FORCE_REAUTH' | 'NOTIFY_USER';
    target?: string;
}

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    lastTriggered?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: ('ALL' | 'HIGH' | 'CRITICAL')[];
    status: 'ACTIVE' | 'PAUSED';
    secret: string;
    lastTriggered?: string;
}

export type View = 
  | 'DASHBOARD' 
  | 'EVENTS'
  | 'SESSIONS' 
  | 'RISK_LOGS' 
  | 'USERS'
  | 'POLICIES' 
  | 'ANALYTICS'
  | 'SETTINGS'
  | 'MY_ACTIVITY' 
  | 'DEV_PLAYGROUND' 
  | 'DEV_DOCS'
  | 'BIOMETRICS';
