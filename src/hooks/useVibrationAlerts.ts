import { useEffect } from 'react';
import { useCodeSession } from '../store/useCodeSession';

let globalAudioCtx: any = null;

export const initAudioContext = () => {
    if (globalAudioCtx) {
        if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
        return;
    }
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        globalAudioCtx = new AudioContextClass();
        const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
        const source = globalAudioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(globalAudioCtx.destination);
        source.start(0);
        if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    } catch (e) {
        // ignore
    }
};

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

        let hasAlertedEpi = false;
        let hasAlertedPulse = false;

        const interval = setInterval(() => {
            const now = new Date().getTime();

            // Check Epi
            if (lastEpiTime) {
                const timeSinceEpi = now - lastEpiTime.getTime();
                if (timeSinceEpi >= epiIntervalMs) {
                    if (!hasAlertedEpi) {
                        triggerAlert("epi");
                        hasAlertedEpi = true;
                    }
                } else {
                    hasAlertedEpi = false;
                }
            }

            // Check Pulse
            if (lastPulseCheckTime) {
                const timeSincePulse = now - lastPulseCheckTime.getTime();
                if (timeSincePulse >= pulseIntervalMs) {
                    if (!hasAlertedPulse) {
                        triggerAlert("pulse");
                        hasAlertedPulse = true;
                    }
                } else {
                    hasAlertedPulse = false;
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

    const playBeep = (freq: number, durationMs: number) => {
        try {
            if (!globalAudioCtx) initAudioContext();
            if (!globalAudioCtx) return;
            if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();

            const osc = globalAudioCtx.createOscillator();
            const gain = globalAudioCtx.createGain();
            osc.connect(gain);
            gain.connect(globalAudioCtx.destination);
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime); // gentle volume
            osc.start();
            setTimeout(() => {
                osc.stop();
            }, durationMs);
        } catch (e) {
            // ignore audio errors
        }
    };

    const triggerAlert = (type: "epi" | "pulse") => {
        const canVibrate = 'vibrate' in navigator;

        if (type === "epi") {
            if (canVibrate) navigator.vibrate([500, 200, 500, 200, 500]);
            playBeep(440, 500); // Beep A4
            setTimeout(() => playBeep(440, 500), 700);
            setTimeout(() => playBeep(440, 500), 1400);
        } else {
            if (canVibrate) navigator.vibrate([300, 100, 300]);
            playBeep(600, 300); // Higher pitch for pulse
            setTimeout(() => playBeep(600, 300), 400);
        }
    };
}
