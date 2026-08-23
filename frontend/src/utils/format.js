// Central mapping of backend enums -> presentation. Keeping this in one
// place means the report UI never has to guess what a status "should" look
// like — and never implies verification the backend didn't actually do.

export const RISK_LEVELS = {
  LOW: { label: 'Low Risk', tone: 'success', order: 0 },
  MODERATE: { label: 'Moderate Risk', tone: 'success', order: 1 },
  MEDIUM: { label: 'Medium Risk', tone: 'warning', order: 2 },
  HIGH: { label: 'High Risk', tone: 'danger', order: 3 },
  VERY_HIGH: { label: 'Very High Risk', tone: 'danger', order: 4 },
};

export function riskLevelInfo(level) {
  return RISK_LEVELS[level] || { label: level || 'Unknown', tone: 'neutral', order: -1 };
}

export function riskScoreTone(score) {
  if (score == null) return 'neutral';
  if (score <= 20) return 'success';
  if (score <= 60) return 'warning';
  return 'danger';
}

// Evidence status -> { label, tone, icon, description }. This distinction is
// the whole point of the product: "observed in the text" is not the same
// claim as "verified against an outside source."
export const EVIDENCE_STATUS = {
  VERIFIED: {
    label: 'Verified',
    tone: 'success',
    icon: 'check-circle',
    hint: 'Confirmed against an independent source',
  },
  OBSERVED: {
    label: 'Observed in message',
    tone: 'neutral',
    icon: 'eye',
    hint: 'Seen in the submitted text — not yet independently confirmed',
  },
  LIKELY: {
    label: 'Likely',
    tone: 'warning',
    icon: 'sparkles',
    hint: 'Inferred with reasonable confidence, not directly confirmed',
  },
  UNCERTAIN: {
    label: 'Needs verification',
    tone: 'warning',
    icon: 'help-circle',
    hint: 'Could not be confirmed one way or the other',
  },
  CONTRADICTED: {
    label: 'Contradicted',
    tone: 'danger',
    icon: 'x-circle',
    hint: 'Conflicts with an independent source',
  },
  NOT_FOUND: {
    label: 'Not found',
    tone: 'neutral',
    icon: 'minus-circle',
    hint: 'No evidence of this was found',
  },
  NOT_IMPLEMENTED: {
    label: 'Unavailable',
    tone: 'neutral',
    icon: 'minus-circle',
    hint: 'This check is not available yet',
  },
};

export function evidenceInfo(status) {
  return EVIDENCE_STATUS[status] || { label: status || 'Unknown', tone: 'neutral', icon: 'help-circle', hint: '' };
}

export const PAYMENT_STATUS = {
  VERIFIED: { label: 'Verified', tone: 'success' },
  NEEDS_VERIFICATION: { label: 'Needs verification', tone: 'warning' },
  NEGATED: { label: 'No payment required', tone: 'success' },
  NOT_FOUND: { label: 'No payment mentioned', tone: 'neutral' },
  CONTRADICTED: { label: 'Contradicted', tone: 'danger' },
  UNKNOWN: { label: 'Unknown', tone: 'neutral' },
  UNCERTAIN: { label: 'Uncertain', tone: 'warning' },
  NOT_IMPLEMENTED: { label: 'Unavailable', tone: 'neutral' },
};

export function paymentStatusInfo(status) {
  return PAYMENT_STATUS[status] || { label: status || 'Unknown', tone: 'neutral' };
}

export const RECOMMENDATION = {
  SAFE_TO_EXPLORE: {
    label: 'Safe to explore',
    tone: 'success',
    summary: 'No major risk indicators were found. Standard due diligence still applies.',
  },
  CAUTION: {
    label: 'Proceed with caution',
    tone: 'warning',
    summary: 'Some signals need a closer look before you commit anything.',
  },
  VERIFY_FIRST: {
    label: 'Verify before proceeding',
    tone: 'warning',
    summary: 'Confirm the flagged details independently before you apply or pay.',
  },
  AVOID_PAYMENT: {
    label: 'Avoid — do not pay',
    tone: 'danger',
    summary: 'Critical risk indicators were detected. Do not send money or sensitive information.',
  },
  INSUFFICIENT_EVIDENCE: {
    label: 'Not enough evidence',
    tone: 'neutral',
    summary: "We couldn't gather enough signal to make a confident call. Verify manually.",
  },
};

export function recommendationInfo(decision) {
  return (
    RECOMMENDATION[decision] || {
      label: decision || 'Unknown',
      tone: 'neutral',
      summary: '',
    }
  );
}

const currencyFormatters = {};
export function formatCurrency(amount, currency = 'INR') {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const key = currency || 'INR';
  if (!currencyFormatters[key]) {
    try {
      currencyFormatters[key] = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: key,
        maximumFractionDigits: 0,
      });
    } catch {
      currencyFormatters[key] = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      });
    }
  }
  return currencyFormatters[key].format(Number(amount));
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const OPPORTUNITY_TYPE_LABEL = {
  INTERNSHIP: 'Internship',
  JOB: 'Job',
  COURSE: 'Course',
  CERTIFICATION: 'Certification',
  TRAINING: 'Training',
  SCHOLARSHIP: 'Scholarship',
  FELLOWSHIP: 'Fellowship',
  OTHER: 'Opportunity',
};

export function opportunityTypeLabel(type) {
  return OPPORTUNITY_TYPE_LABEL[type] || 'Opportunity';
}

export function totalFees(fees) {
  if (!fees) return 0;
  return Object.entries(fees).reduce((sum, [key, value]) => {
    if (key === 'currency' || key === 'other') return sum;
    return typeof value === 'number' ? sum + value : sum;
  }, 0);
}
