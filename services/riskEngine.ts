
import { RiskLevel } from '../types';

export interface RiskInput {
  isNewDevice: boolean;
  isNewLocation: boolean;
  isImpossibleTravel: boolean;
  isUnusualTime: boolean;
  typingSpeedDeviation: boolean;
  typingConsistencyErratic: boolean;
  failedAttempts: number;
  navigationSensitive: boolean;
  navigationBotLike: boolean;
  
  // New Behavioral Signals
  mouseSpeedAnomaly?: boolean;
  mousePathRobotic?: boolean;
  clickRateAnomaly?: boolean;
  rageClicksDetected?: boolean;
  nonInteractiveClicks?: boolean;
  typingErrorRateHigh?: boolean; // Backspaces > 15%
  typingPerfectBot?: boolean;    // High speed + 0 errors
  sensitiveFieldPaste?: boolean;

  // New Form Interaction Anomalies
  formCompletionSpeedHigh?: boolean;
  formFieldOrderUnusual?: boolean;
  hesitationAnomaly?: boolean;
}

export interface RiskOutput {
  score: number;
  level: RiskLevel;
  action: 'ALLOWED' | 'MFA_REQ' | 'BLOCKED' | 'LOCKED';
  breakdown: { reason: string; score: number }[];
  factors: string[];
}

/**
 * 6. RISK ENGINE LOGIC (UPDATED)
 * Base score: 10
 * Additions based on specific flags including detailed biometrics.
 * Clamped 0-100.
 */
export const calculateRiskScore = (input: RiskInput): RiskOutput => {
  let score = 10; // Start at base 10
  const breakdown: { reason: string; score: number }[] = [];
  const factors: string[] = [];

  // --- Identity & Context Rules ---
  if (input.isNewDevice) {
    score += 25;
    breakdown.push({ reason: 'New Device Detected', score: 25 });
    factors.push('New Device');
  }
  
  if (input.isNewLocation) {
    score += 20;
    breakdown.push({ reason: 'New Location', score: 20 });
    factors.push('New Location');
  }

  if (input.isImpossibleTravel) {
    score += 20;
    breakdown.push({ reason: 'Impossible Travel Velocity', score: 20 });
    factors.push('Impossible Travel');
  }

  if (input.isUnusualTime) {
    score += 10;
    breakdown.push({ reason: 'Unusual Time (Baseline)', score: 10 });
    factors.push('Unusual Time');
  }

  if (input.failedAttempts > 3) {
    score += 15;
    breakdown.push({ reason: 'Excessive Failed Attempts', score: 15 });
    factors.push('Brute Force Risk');
  }

  if (input.navigationSensitive) {
    score += 20;
    breakdown.push({ reason: 'Direct Jump to Sensitive Page', score: 20 });
    factors.push('Suspicious Nav');
  }

  if (input.navigationBotLike) {
    score += 20;
    breakdown.push({ reason: 'Bot-like Navigation Speed', score: 20 });
    factors.push('Bot Behavior');
  }

  // --- Behavioral Biometrics Rules ---

  // Mouse Anomalies
  if (input.mouseSpeedAnomaly) {
    score += 10;
    breakdown.push({ reason: 'Unusual mouse speed', score: 10 });
    factors.push('Unusual mouse speed');
  }
  if (input.mousePathRobotic) {
    score += 10;
    breakdown.push({ reason: 'Robotic mouse pattern', score: 10 });
    factors.push('Robotic mouse pattern');
  }

  // Click Anomalies
  if (input.clickRateAnomaly) {
    score += 10;
    breakdown.push({ reason: 'Abnormal Click Frequency', score: 10 });
    factors.push('Click Flooding');
  }
  if (input.rageClicksDetected) {
    score += 10;
    breakdown.push({ reason: 'Rage clicks', score: 10 });
    factors.push('Rage clicks');
  }
  if (input.nonInteractiveClicks) {
    score += 5;
    breakdown.push({ reason: 'Clicks on non-interactive areas', score: 5 });
    factors.push('Confusion / Script');
  }

  // Typing Anomalies
  if (input.typingSpeedDeviation) {
    score += 10;
    breakdown.push({ reason: 'Typing Speed Deviation', score: 10 });
    factors.push('Abnormal Typing');
  }
  if (input.typingConsistencyErratic) {
    score += 10;
    breakdown.push({ reason: 'Erratic Typing Rhythm', score: 10 });
    factors.push('Erratic Typing');
  }
  if (input.typingErrorRateHigh) {
    score += 15;
    breakdown.push({ reason: 'High typing error rate', score: 15 });
    factors.push('High typing error rate');
  }
  if (input.typingPerfectBot) {
    score += 10;
    breakdown.push({ reason: 'Superhuman Typing Speed', score: 10 });
    factors.push('Script Injection');
  }
  if (input.sensitiveFieldPaste) {
    score += 10;
    breakdown.push({ reason: 'Copy–paste into password', score: 10 });
    factors.push('Copy–paste into password');
  }

  // --- Form Interaction Anomalies ---
  if (input.formCompletionSpeedHigh) {
    score += 10;
    breakdown.push({ reason: 'Unrealistically fast form', score: 10 });
    factors.push('Unrealistically fast form');
  }
  if (input.formFieldOrderUnusual) {
    score += 10;
    breakdown.push({ reason: 'Unusual field order', score: 10 });
    factors.push('Unusual field order');
  }
  if (input.hesitationAnomaly) {
    score += 10;
    breakdown.push({ reason: 'Extreme Hesitation', score: 10 });
    factors.push('Anomaly');
  }

  // --- Clamping ---
  score = Math.min(100, Math.max(0, score));

  // --- Mapping to Level & Action ---
  let level: RiskLevel = RiskLevel.LOW;
  let action: 'ALLOWED' | 'MFA_REQ' | 'BLOCKED' | 'LOCKED' = 'ALLOWED';

  if (score <= 30) {
    level = RiskLevel.LOW;
    action = 'ALLOWED';
  } else if (score <= 60) {
    level = RiskLevel.MEDIUM;
    // "Allow + Monitor" -> We map to ALLOWED but app logic handles monitoring
    action = 'ALLOWED'; 
  } else if (score <= 80) {
    level = RiskLevel.HIGH;
    action = 'MFA_REQ';
  } else {
    level = RiskLevel.CRITICAL;
    action = 'BLOCKED';
  }

  return { score, level, action, breakdown, factors };
};
