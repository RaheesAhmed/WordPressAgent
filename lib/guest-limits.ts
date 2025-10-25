const GUEST_MESSAGE_LIMIT_KEY = 'wp_agent_guest_messages';
const GUEST_MESSAGE_LIMIT = 3;

export function getGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const stored = localStorage.getItem(GUEST_MESSAGE_LIMIT_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function incrementGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const currentCount = getGuestMessageCount();
  const newCount = currentCount + 1;
  localStorage.setItem(GUEST_MESSAGE_LIMIT_KEY, newCount.toString());
  return newCount;
}

export function resetGuestMessageCount(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(GUEST_MESSAGE_LIMIT_KEY);
}

export function hasReachedGuestMessageLimit(): boolean {
  return getGuestMessageCount() >= GUEST_MESSAGE_LIMIT;
}

export function getGuestMessageLimit(): number {
  return GUEST_MESSAGE_LIMIT;
}