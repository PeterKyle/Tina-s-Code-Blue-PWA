/**
 * Utility for handling Web Vibration API.
 * 
 * Android supports Vibration API.
 * iOS Safari/PWAs do NOT support `navigator.vibrate`.
 * Vibration generally requires a user gesture and can be blocked by device settings or battery saver.
 */

export const isVibrationSupported = (): boolean => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

let __hapticsEnabled = false;

/**
 * Call this on first user interaction to unlock haptics.
 */
export const enableHapticsOnFirstInteraction = () => {
    if (__hapticsEnabled) return;
    __hapticsEnabled = true;
    if (typeof window !== 'undefined') {
        (window as any).__hapticsEnabled = true;
    }
};

if (typeof window !== 'undefined') {
    const opts = { once: true, passive: true };
    window.addEventListener('click', enableHapticsOnFirstInteraction, opts);
    window.addEventListener('touchstart', enableHapticsOnFirstInteraction, opts);
    window.addEventListener('keydown', enableHapticsOnFirstInteraction, opts);
}

export const vibrateOnce = (ms: number): boolean => {
    if (!__hapticsEnabled || !isVibrationSupported()) return false;
    try {
        return navigator.vibrate(ms);
    } catch (e) {
        return false;
    }
};

export const vibratePattern = (pattern: number[]): boolean => {
    if (!__hapticsEnabled || !isVibrationSupported()) return false;
    try {
        return navigator.vibrate(pattern);
    } catch (e) {
        return false;
    }
};

export const stopVibration = (): boolean => {
    if (!isVibrationSupported()) return false;
    try {
        return navigator.vibrate(0);
    } catch (e) {
        return false;
    }
};
