import { useEffect } from 'react';
import { useCodeSession } from '../store/useCodeSession';

export function useVibrationAlerts() {
    const {
        isActive,
        vibrationEnabled,
        lastEpiTime,
        epiIntervalMs,
        lastPulseCheckTime,
        pulseIntervalMs
    } = useCodeSession();

    useEffect(() => {
        if (!isActive || !vibrationEnabled) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();

            // Check Epi
            if (lastEpiTime) {
                const timeSinceEpi = now - lastEpiTime.getTime();
                // Trigger if we are past the interval, and haven't alerted in the last 2 seconds to avoid spam
                if (timeSinceEpi >= epiIntervalMs && timeSinceEpi < epiIntervalMs + 2000) {
                    triggerVibration([500, 200, 500, 200, 500]); // 3 long pulses for Epi
                }
            }

            // Check Pulse
            if (lastPulseCheckTime) {
                const timeSincePulse = now - lastPulseCheckTime.getTime();
                if (timeSincePulse >= pulseIntervalMs && timeSincePulse < pulseIntervalMs + 2000) {
                    triggerVibration([300, 100, 300]); // 2 short pulses for Pulse
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [
        isActive,
        vibrationEnabled,
        lastEpiTime,
        epiIntervalMs,
        lastPulseCheckTime,
        pulseIntervalMs
    ]);

    const triggerVibration = (pattern: number[]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };
}
