/**
 * Haptic feedback helpers using the Vibration API.
 * Silently degrades on devices without vibration support.
 */

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/** Light tap feedback (10ms) */
export function triggerTapHaptic() {
  if (canVibrate()) {
    navigator.vibrate(10);
  }
}

/** Double-buzz lock-on pattern */
export function triggerLockOnHaptic() {
  if (canVibrate()) {
    navigator.vibrate([50, 50, 50]);
  }
}

/** Success celebration buzz */
export function triggerSuccessHaptic() {
  if (canVibrate()) {
    navigator.vibrate([30, 30, 30, 30, 80]);
  }
}
