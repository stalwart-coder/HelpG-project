// Mock data for booking flow

export const PAYMENT_METHODS = [
  {
    id: 'wallet',
    name: 'HelpJi Wallet',
    desc: 'Pay from your wallet balance',
    balance: 1250,
    icon: '💰',
    tag: 'Recommended',
  },
  {
    id: 'upi',
    name: 'UPI',
    desc: 'Google Pay, PhonePe, Paytm',
    icon: '📱',
    tag: null,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay',
    icon: '💳',
    tag: null,
  },
  {
    id: 'cod',
    name: 'Cash on Completion',
    desc: 'Pay after the task is done',
    icon: '💵',
    tag: null,
  },
];

export const PRICE_BREAKDOWN = {
  iron: { base: 360, platformFee: 18, tax: 7, total: 385 },
  vehicle: { base: 340, platformFee: 17, tax: 7, total: 364 },
  guard: { base: 1250, platformFee: 62, tax: 25, total: 1337 },
  event: { base: 3200, platformFee: 160, tax: 64, total: 3424 },
};

export const CANCELLATION_REASONS = [
  { id: 'no_need', label: 'No longer need this service', sub: 'Changed plans or found another arrangement' },
  { id: 'wrong_details', label: 'Incorrect task details', sub: 'I entered the wrong date, location, or description' },
  { id: 'price_issue', label: 'Budget / price concern', sub: 'The response is higher than expected' },
  { id: 'helper_issue', label: 'Concern about the helper', sub: 'Prefer not to share details' },
  { id: 'emergency', label: 'Emergency / personal reason', sub: 'Urgent personal matter came up' },
  { id: 'other', label: 'Other reason', sub: 'I will explain in notes' },
];

export const RESCHEDULE_PRESETS = [
  { id: 'today_3h', label: 'Today', sub: '3 hours later' },
  { id: 'tomorrow_morning', label: 'Tomorrow morning', sub: '8:00 AM - 12:00 PM' },
  { id: 'tomorrow_evening', label: 'Tomorrow evening', sub: '4:00 PM - 8:00 PM' },
  { id: 'this_weekend', label: 'This weekend', sub: 'Saturday or Sunday' },
  { id: 'next_week', label: 'Next week', sub: 'Pick a day' },
  { id: 'custom', label: 'Pick custom date', sub: 'Choose your own date & time' },
];

export const TIP_AMOUNTS = [20, 30, 50, 70, 100];

export const REPORT_REASONS = [
  { id: 'incomplete', label: 'Task not completed', sub: 'The helper left without finishing the job' },
  { id: 'damage', label: 'Property damage', sub: 'Something was broken, stained, or damaged' },
  { id: 'late', label: 'Extreme delay / no-show', sub: 'Helper arrived very late or never showed up' },
  { id: 'quality', label: 'Poor quality of work', sub: 'The service was below acceptable standards' },
  { id: 'behavior', label: 'Inappropriate behaviour', sub: 'Rude, aggressive, or unprofessional conduct' },
  { id: 'pricing', label: 'Price disagreement', sub: 'Final charge was different from the agreed price' },
  { id: 'other', label: 'Other issue', sub: 'Something else not listed above' },
];

export const DISPUTE_REASONS = [
  { id: 'payment', label: 'Payment dispute', sub: 'Charge is incorrect or unauthorized' },
  { id: 'completion', label: 'Task completion dispute', sub: 'We disagree on whether the task was completed' },
  { id: 'refund', label: 'Refund dispute', sub: 'Disagree with the refund amount or policy' },
  { id: 'cancellation', label: 'Cancellation fee dispute', sub: 'I was charged for a cancellation I did not authorize' },
  { id: 'other', label: 'Other dispute', sub: 'Something else I need help resolving' },
];

export const DISPUTE_STATUS = [
  { id: 'opened', label: 'Opened', sub: 'Your dispute has been received' },
  { id: 'investigating', label: 'Under investigation', sub: 'Our team is reviewing the case' },
  { id: 'resolved', label: 'Resolved', sub: 'A decision has been reached' },
  { id: 'closed', label: 'Closed', sub: 'This dispute is no longer active' },
];

