
import { Session, SessionStatus, RiskLevel, User, SecurityEvent, UserStats, TrustedDevice, UserAnomaly, SessionHistoryEvent, SecurityPolicy } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice.c@sentinel.ai', role: 'ADMIN', department: 'DevOps', avatar: 'AC' },
  { id: 'u2', name: 'Bob Smith', email: 'bob.s@sentinel.ai', role: 'USER', department: 'Sales', avatar: 'BS' },
  { id: 'u3', name: 'Charlie Davis', email: 'charlie.d@sentinel.ai', role: 'USER', department: 'Marketing', avatar: 'CD' },
  { id: 'u4', name: 'Sarah Wilson', email: 'sarah.w@sentinel.ai', role: 'ADMIN', department: 'Security', avatar: 'SW' },
  { id: 'u5', name: 'David Kim', email: 'david.k@sentinel.ai', role: 'USER', department: 'Finance', avatar: 'DK' },
];

const generateRiskHistory = (baseRisk: number, volatility: number) => {
    return Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        let score = baseRisk + (Math.random() * volatility * 2 - volatility);
        if (Math.random() > 0.9) score += 40; // Random spike
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.max(0, Math.min(100, Math.floor(score)))
        };
    });
};

// Generate realistic 7x24 heatmap (Day x Hour). 0-10 scale.
const generateHeatmap = (profile: 'normal' | 'nightowl' | 'random') => {
    const matrix: number[][] = [];
    for (let d = 0; d < 7; d++) {
        const row: number[] = [];
        for (let h = 0; h < 24; h++) {
            let val = 0;
            if (profile === 'normal') {
                if (d < 5 && h >= 9 && h <= 18) val = Math.floor(Math.random() * 6) + 4; // Work hours
                else val = Math.floor(Math.random() * 2);
            } else if (profile === 'nightowl') {
                if (h >= 20 || h <= 4) val = Math.floor(Math.random() * 7) + 3;
                else val = Math.floor(Math.random() * 3);
            } else {
                val = Math.floor(Math.random() * 10);
            }
            row.push(val);
        }
        matrix.push(row);
    }
    return matrix;
};

const generateDevices = (userId: string): TrustedDevice[] => [
    { id: `dev_${userId}_1`, name: 'MacBook Pro 16"', type: 'DESKTOP', os: 'macOS Sonoma', lastUsed: 'Just now', status: 'TRUSTED', fingerprint: 'fp_a1b2c3d4', firstSeen: '2023-11-15' },
    { id: `dev_${userId}_2`, name: 'iPhone 15 Pro', type: 'MOBILE', os: 'iOS 17.2', lastUsed: '2 hours ago', status: 'TRUSTED', fingerprint: 'fp_x9y8z7', firstSeen: '2024-01-20' },
    { id: `dev_${userId}_3`, name: 'Windows Workstation', type: 'DESKTOP', os: 'Windows 11', lastUsed: '14 days ago', status: 'UNTRUSTED', fingerprint: 'fp_win_old', firstSeen: '2023-05-10' }
];

const generateAnomalies = (): UserAnomaly[] => [
    { id: 'anom_1', timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(), riskScore: 85, reasons: ['Impossible Travel', 'New IP'], action: 'BLOCKED' },
    { id: 'anom_2', timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(), riskScore: 45, reasons: ['Unusual Time', 'Rage Clicks'], action: 'MFA_REQ' },
    { id: 'anom_3', timestamp: new Date(Date.now() - 1000 * 3600 * 120).toISOString(), riskScore: 65, reasons: ['New Device', 'High Typing Errors'], action: 'ALLOWED' },
];

export const MOCK_USER_STATS: Record<string, UserStats> = {
    'u1': {
        userId: 'u1', currentRiskLevel: RiskLevel.LOW, logins7d: 45, logins30d: 180, highRiskRate: 1.2, trustedDevices: 3,
        lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(), lastLocation: 'San Francisco, US',
        tags: ['Consistent Location', 'Standard Hours', 'Known Device'],
        riskHistory: generateRiskHistory(10, 5), accountStatus: 'ACTIVE',
        behaviorProfile: {
            usualLocations: ['San Francisco, US', 'Oakland, US', 'San Jose, US'],
            usualDevices: ['MacBook Pro 16"', 'iPhone 15'],
            typingSpeedAvg: 68,
            typingVarianceLabel: 'Consistent',
            activityHeatmap: generateHeatmap('normal')
        },
        avgErrorRate: 4.5, avgFormTime: 12.2, pasteFrequency: 2,
        devices: generateDevices('u1'),
        recentAnomalies: []
    },
    'u2': {
        userId: 'u2', currentRiskLevel: RiskLevel.CRITICAL, logins7d: 12, logins30d: 40, highRiskRate: 45.5, trustedDevices: 1,
        lastLogin: new Date(Date.now() - 1000 * 60 * 2).toISOString(), lastLocation: 'Lagos, NG',
        tags: ['Impossible Travel', 'Device Hopping', 'Anomalous IP'],
        riskHistory: generateRiskHistory(60, 25), accountStatus: 'LOCKED',
         behaviorProfile: {
            usualLocations: ['New York, US'],
            usualDevices: ['Windows 10 Desktop'],
            typingSpeedAvg: 210, // suspicious
            typingVarianceLabel: 'Bot-like',
            activityHeatmap: generateHeatmap('random')
        },
        avgErrorRate: 0.1, avgFormTime: 0.5, pasteFrequency: 95,
        devices: generateDevices('u2'),
        recentAnomalies: generateAnomalies()
    },
    'u3': {
        userId: 'u3', currentRiskLevel: RiskLevel.MEDIUM, logins7d: 22, logins30d: 85, highRiskRate: 12.0, trustedDevices: 2,
        lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(), lastLocation: 'London, UK',
        tags: ['New Location', 'Mobile Access'],
        riskHistory: generateRiskHistory(35, 15), accountStatus: 'ACTIVE',
        behaviorProfile: {
            usualLocations: ['London, UK', 'Manchester, UK'],
            usualDevices: ['iPad Pro', 'iPhone 13'],
            typingSpeedAvg: 45,
            typingVarianceLabel: 'Consistent',
            activityHeatmap: generateHeatmap('normal')
        },
        avgErrorRate: 8.2, avgFormTime: 18.5, pasteFrequency: 5,
        devices: generateDevices('u3'),
        recentAnomalies: [generateAnomalies()[1]]
    },
    'u4': {
        userId: 'u4', currentRiskLevel: RiskLevel.LOW, logins7d: 50, logins30d: 210, highRiskRate: 0.5, trustedDevices: 4,
        lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(), lastLocation: 'San Francisco, US',
        tags: ['Security Admin', 'High Activity'],
        riskHistory: generateRiskHistory(5, 2), accountStatus: 'ACTIVE',
        behaviorProfile: {
            usualLocations: ['San Francisco, US', 'Seattle, US'],
            usualDevices: ['Dell XPS 13', 'Pixel 8'],
            typingSpeedAvg: 90,
            typingVarianceLabel: 'Consistent',
            activityHeatmap: generateHeatmap('nightowl')
        },
        avgErrorRate: 2.1, avgFormTime: 8.8, pasteFrequency: 12,
        devices: generateDevices('u4'),
        recentAnomalies: []
    },
    'u5': {
        userId: 'u5', currentRiskLevel: RiskLevel.LOW, logins7d: 18, logins30d: 65, highRiskRate: 2.1, trustedDevices: 1,
        lastLogin: new Date(Date.now() - 1000 * 60 * 300).toISOString(), lastLocation: 'New York, US',
        tags: ['Finance Dept', 'Consistent Device'],
        riskHistory: generateRiskHistory(12, 8), accountStatus: 'ACTIVE',
        behaviorProfile: {
            usualLocations: ['New York, US', 'New Jersey, US'],
            usualDevices: ['ThinkPad X1'],
            typingSpeedAvg: 55,
            typingVarianceLabel: 'Consistent',
            activityHeatmap: generateHeatmap('normal')
        },
        avgErrorRate: 6.5, avgFormTime: 15.0, pasteFrequency: 0,
        devices: generateDevices('u5'),
        recentAnomalies: []
    }
};

const createEvents = (startTime: number): SessionHistoryEvent[] => [
    { id: 'h1', timestamp: new Date(startTime).toISOString(), type: 'SYSTEM', description: 'Session initialized', riskScore: 0 },
    { id: 'h2', timestamp: new Date(startTime + 2000).toISOString(), type: 'NAVIGATION', description: 'Dashboard', riskScore: 0 },
    { id: 'h3', timestamp: new Date(startTime + 15000).toISOString(), type: 'NAVIGATION', description: 'User Profile', riskScore: 5 },
    { id: 'h4', timestamp: new Date(startTime + 45000).toISOString(), type: 'ACTION', description: 'Viewed Security Settings', riskScore: 10 },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-101',
    user: MOCK_USERS[0],
    ip: '192.168.1.42',
    location: 'San Francisco, US',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 122',
    os: 'macOS Sonoma',
    startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    lastActive: new Date().toISOString(),
    riskScore: 12,
    riskLevel: RiskLevel.LOW,
    status: SessionStatus.ACTIVE,
    riskFactors: [],
    behavioralData: { typingSpeed: 65, typingVariance: 0.4, mouseVelocity: 450, clickRate: 12 },
    eventHistory: createEvents(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'sess-102',
    user: MOCK_USERS[1],
    ip: '45.22.19.112',
    location: 'Lagos, NG',
    device: 'Unknown Linux Device',
    browser: 'Firefox 110',
    os: 'Linux',
    startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    lastActive: new Date().toISOString(),
    riskScore: 94,
    riskLevel: RiskLevel.CRITICAL,
    status: SessionStatus.ACTIVE,
    riskFactors: ['Impossible Travel', 'Datacenter IP', 'Anomalous Device'],
    behavioralData: { typingSpeed: 800, typingVariance: 0.01, mouseVelocity: 0, clickRate: 150 },
    eventHistory: [
        { id: 'h1', timestamp: new Date(Date.now() - 120000).toISOString(), type: 'SYSTEM', description: 'Session initialized (TOR Exit Node)', riskScore: 40 },
        { id: 'h2', timestamp: new Date(Date.now() - 110000).toISOString(), type: 'NAVIGATION', description: 'Direct Link to /settings/billing', riskScore: 60, details: 'User bypassed dashboard' },
        { id: 'h3', timestamp: new Date(Date.now() - 100000).toISOString(), type: 'ACTION', description: 'Attempted to export customer list', riskScore: 75 },
        { id: 'h4', timestamp: new Date(Date.now() - 95000).toISOString(), type: 'ANOMALY', description: 'Copy-Paste Anomaly', riskScore: 90, details: 'Bulk data copy detected (Clipboard)' },
        { id: 'h5', timestamp: new Date(Date.now() - 90000).toISOString(), type: 'ANOMALY', description: 'Rage Clicks Detected', riskScore: 95, details: '20 clicks in 2s on "Transfer" button' },
        { id: 'h6', timestamp: new Date(Date.now() - 85000).toISOString(), type: 'ANOMALY', description: 'Device/IP changed mid-session', riskScore: 95, details: 'IP shifted to different subnet' }
    ]
  },
  {
    id: 'sess-103',
    user: MOCK_USERS[2],
    ip: '67.11.90.221',
    location: 'London, UK',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    os: 'iOS 17',
    startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    riskScore: 45,
    riskLevel: RiskLevel.MEDIUM,
    status: SessionStatus.CHALLENGED,
    riskFactors: ['New Location', 'Typing Anomaly'],
    behavioralData: { typingSpeed: 35, typingVariance: 0.3, mouseVelocity: 0, clickRate: 5 },
    eventHistory: createEvents(Date.now() - 1000 * 60 * 45).concat([
         { id: 'h5', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'ANOMALY', description: 'High Typing Error Rate', riskScore: 45, details: 'Backspaces > 20% of keystrokes' }
    ])
  },
  {
    id: 'sess-104',
    user: MOCK_USERS[3],
    ip: '203.0.113.5',
    location: 'San Francisco, US',
    device: 'Dell XPS 13',
    browser: 'Edge',
    os: 'Windows 11',
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    riskScore: 5,
    riskLevel: RiskLevel.LOW,
    status: SessionStatus.ACTIVE,
    riskFactors: [],
    behavioralData: { typingSpeed: 72, typingVariance: 0.5, mouseVelocity: 320, clickRate: 20 },
    eventHistory: createEvents(Date.now() - 1000 * 60 * 120)
  }
];

export const MOCK_EVENTS: SecurityEvent[] = [
    {
        id: 'evt_1', timestamp: new Date(Date.now() - 1000 * 30).toISOString(), type: 'LOGIN_SUCCESS',
        user: MOCK_USERS[0], riskLevel: RiskLevel.LOW, riskScore: 12, action: 'ALLOWED', source: 'WEB',
        location: 'San Francisco, US', ip: '192.168.1.42', device: 'Chrome / macOS'
    },
    {
        id: 'evt_2', timestamp: new Date(Date.now() - 1000 * 120).toISOString(), type: 'LOGIN_FAILED',
        user: MOCK_USERS[1], riskLevel: RiskLevel.HIGH, riskScore: 78, action: 'MFA_REQ', source: 'MOBILE',
        location: 'Moscow, RU', ip: '88.21.32.11', device: 'Unknown Mobile'
    },
    {
        id: 'evt_3', timestamp: new Date(Date.now() - 1000 * 300).toISOString(), type: 'API_ACCESS',
        user: MOCK_USERS[4], riskLevel: RiskLevel.LOW, riskScore: 5, action: 'ALLOWED', source: 'API',
        location: 'New York, US', ip: '54.22.11.90', device: 'Postman Runtime'
    },
    {
        id: 'evt_4', timestamp: new Date(Date.now() - 1000 * 600).toISOString(), type: 'MFA_CHALLENGE',
        user: MOCK_USERS[2], riskLevel: RiskLevel.MEDIUM, riskScore: 45, action: 'MFA_REQ', source: 'WEB',
        location: 'London, UK', ip: '67.11.90.221', device: 'Safari / iOS'
    },
    {
        id: 'evt_5', timestamp: new Date(Date.now() - 1000 * 900).toISOString(), type: 'LOGIN_SUCCESS',
        user: MOCK_USERS[3], riskLevel: RiskLevel.LOW, riskScore: 8, action: 'ALLOWED', source: 'WEB',
        location: 'San Francisco, US', ip: '203.0.113.5', device: 'Edge / Windows'
    }
];

export const CHART_DATA = [
  { time: '00:00', risk: 12 },
  { time: '04:00', risk: 15 },
  { time: '08:00', risk: 45 },
  { time: '12:00', risk: 65 },
  { time: '14:00', risk: 85 },
  { time: '16:00', risk: 55 },
  { time: '20:00', risk: 30 },
  { time: '23:59', risk: 25 },
];

export const MOCK_GEO_LOCATIONS = [
    { lat: 37.7749, lng: -122.4194, risk: RiskLevel.LOW, location: 'San Francisco, US' },
    { lat: 51.5074, lng: -0.1278, risk: RiskLevel.MEDIUM, location: 'London, UK' },
    { lat: 6.5244, lng: 3.3792, risk: RiskLevel.CRITICAL, location: 'Lagos, NG' },
    { lat: 35.6762, lng: 139.6503, risk: RiskLevel.LOW, location: 'Tokyo, JP' },
    { lat: -33.8688, lng: 151.2093, risk: RiskLevel.LOW, location: 'Sydney, AU' },
];

export const MOCK_POLICIES: SecurityPolicy[] = [
    {
        id: 'pol_1',
        name: 'High Risk Login Block',
        description: 'Automatically block any login attempts that exceed the critical risk threshold.',
        isEnabled: true,
        severity: 'CRITICAL',
        conditions: [
            { field: 'RISK_SCORE', operator: 'GT', value: 85 }
        ],
        actions: [
            { type: 'BLOCK' },
            { type: 'NOTIFY_ADMIN', target: 'SecurityTeam' }
        ],
        lastTriggered: '2 mins ago'
    },
    {
        id: 'pol_2',
        name: 'Impossible Travel Challenge',
        description: 'Require MFA when user logs in from a location physically impossible to reach from previous.',
        isEnabled: true,
        severity: 'HIGH',
        conditions: [
            { field: 'BEHAVIOR', operator: 'CONTAINS', value: 'Impossible Travel' }
        ],
        actions: [
            { type: 'MFA' },
            { type: 'LOG_ONLY' }
        ],
        lastTriggered: '1 hour ago'
    },
    {
        id: 'pol_3',
        name: 'New Device Verification',
        description: 'Flag logins from devices not seen in the last 30 days.',
        isEnabled: true,
        severity: 'MEDIUM',
        conditions: [
            { field: 'DEVICE', operator: 'EQUALS', value: 'New Device' }
        ],
        actions: [
            { type: 'MFA' },
            { type: 'LOG_ONLY' }
        ],
        lastTriggered: '5 mins ago'
    },
    {
        id: 'pol_4',
        name: 'Tor Exit Node Block',
        description: 'Prevent access from known Tor exit nodes and anonymizers.',
        isEnabled: false,
        severity: 'HIGH',
        conditions: [
            { field: 'IP_REP', operator: 'EQUALS', value: 'Tor Exit Node' }
        ],
        actions: [
            { type: 'BLOCK' }
        ],
        lastTriggered: '3 days ago'
    }
];
