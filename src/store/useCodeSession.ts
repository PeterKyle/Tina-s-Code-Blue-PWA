import { create } from "zustand";

export type EventType =
    | "CODE_START"
    | "CODE_END"
    | "EPI_GIVEN"
    | "DRUG_ADMINISTERED"
    | "COMPRESSION_START"
    | "COMPRESSION_PAUSE"
    | "COMPRESSION_RESUME"
    | "COMPRESSION_STOP"
    | "SHOCK_ADMINISTERED"
    | "RHYTHM_EVENT"
    | "ALERT_TRIGGERED";

export interface CodeEvent {
    id: string;
    type: EventType;
    label: string;
    relativeTimeMs: number; // ms since code start
    timestamp: Date;
    details?: string;
}

interface CodeSessionState {
    sessionId: string | null;
    isActive: boolean;
    startTime: Date | null;
    endTime: Date | null;
    events: CodeEvent[];

    // Timers states
    lastEpiTime: Date | null;
    lastPulseCheckTime: Date | null;
    lastShockTime: Date | null;
    compressionsActive: boolean;
    compressionsStartTime: Date | null;
    totalCompressionsMs: number;

    // Settings
    vibrationEnabled: boolean;
    epiIntervalMs: number;
    pulseIntervalMs: number;
    lockMode: boolean;
    alertToast: string | null;

    // Actions
    startCode: () => void;
    endCode: () => void;
    logEvent: (type: EventType, label: string, details?: string) => void;
    logEpi: () => void;
    logPulseCheck: () => void;
    toggleCompressions: () => void;
    undoLastEvent: () => void;
    setVibrationEnabled: (enabled: boolean) => void;
    setLockMode: (locked: boolean) => void;
    updateSettings: (epiMins: number, pulseMins: number) => void;
    showToast: (msg: string) => void;
    hideToast: () => void;
}

export const useCodeSession = create<CodeSessionState>((set, get) => ({
    sessionId: null,
    isActive: false,
    startTime: null,
    endTime: null,
    events: [],

    lastEpiTime: null,
    lastPulseCheckTime: null,
    lastShockTime: null,
    compressionsActive: false,
    compressionsStartTime: null,
    totalCompressionsMs: 0,

    vibrationEnabled: true,
    epiIntervalMs: 3 * 60 * 1000, // 3 mins default
    pulseIntervalMs: 2 * 60 * 1000, // 2 mins default
    lockMode: false,
    alertToast: null,

    startCode: () => {
        const now = new Date();
        set({
            sessionId: crypto.randomUUID(),
            isActive: true,
            startTime: now,
            endTime: null,
            events: [
                {
                    id: crypto.randomUUID(),
                    type: "CODE_START",
                    label: "Code Started",
                    relativeTimeMs: 0,
                    timestamp: now,
                },
            ],
            lastEpiTime: null,
            lastPulseCheckTime: now, // Start pulse check timer from code start
            lastShockTime: null,
            compressionsActive: false,
            compressionsStartTime: null,
            totalCompressionsMs: 0,
            lockMode: false,
        });
    },

    endCode: () => {
        const { startTime, events, isActive, compressionsActive, compressionsStartTime, totalCompressionsMs } = get();
        if (!isActive || !startTime) return;

        const now = new Date();
        const relativeTimeMs = now.getTime() - startTime.getTime();

        let newTotalCompressions = totalCompressionsMs;
        const newEvents = [...events];

        // If compressions were active, stop them automatically
        if (compressionsActive && compressionsStartTime) {
            newTotalCompressions += now.getTime() - compressionsStartTime.getTime();
            newEvents.push({
                id: crypto.randomUUID(),
                type: "COMPRESSION_STOP",
                label: "Compressions Stopped (Code End)",
                relativeTimeMs,
                timestamp: now,
            });
        }

        newEvents.push({
            id: crypto.randomUUID(),
            type: "CODE_END",
            label: "Code Ended",
            relativeTimeMs,
            timestamp: now,
        });

        set({
            isActive: false,
            endTime: now,
            events: newEvents,
            compressionsActive: false,
            compressionsStartTime: null,
            totalCompressionsMs: newTotalCompressions,
        });
    },

    logEvent: (type: EventType, label: string, details?: string) => {
        const { isActive, startTime, events } = get();
        if (!isActive || !startTime) return;

        const now = new Date();
        const relativeTimeMs = now.getTime() - startTime.getTime();

        const newEvents = [
            {
                id: crypto.randomUUID(),
                type,
                label,
                relativeTimeMs,
                timestamp: now,
                details,
            },
            ...events, // prepend for reverse chronological? actually, let's keep chronological, append to end. Wait, timeline UI can reverse it.
            // appending is standard. Let's append:
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // actually, sorting descending makes index 0 the newest

        const payload: Partial<CodeSessionState> = { events: newEvents };
        if (type === "SHOCK_ADMINISTERED") {
            payload.lastShockTime = now;
        }

        set(payload);
    },

    logEpi: () => {
        const { isActive, startTime, events } = get();
        if (!isActive || !startTime) return;

        const now = new Date();
        const relativeTimeMs = now.getTime() - startTime.getTime();

        set({
            lastEpiTime: now,
            events: [
                {
                    id: crypto.randomUUID(),
                    type: "EPI_GIVEN",
                    label: "Epinephrine Given",
                    relativeTimeMs,
                    timestamp: now,
                },
                ...events,
            ],
        });
    },

    logPulseCheck: () => {
        const { isActive, startTime, events } = get();
        if (!isActive || !startTime) return;

        const now = new Date();
        const relativeTimeMs = now.getTime() - startTime.getTime();

        set({
            lastPulseCheckTime: now,
            events: [
                {
                    id: crypto.randomUUID(),
                    type: "RHYTHM_EVENT",
                    label: "Pulse Check Completed",
                    relativeTimeMs,
                    timestamp: now,
                },
                ...events,
            ],
        });
    },

    toggleCompressions: () => {
        const { isActive, startTime, events, compressionsActive, compressionsStartTime, totalCompressionsMs } = get();
        if (!isActive || !startTime) return;

        const now = new Date();
        const relativeTimeMs = now.getTime() - startTime.getTime();

        if (compressionsActive) {
            // Pause
            const sessionDuration = compressionsStartTime ? now.getTime() - compressionsStartTime.getTime() : 0;
            set({
                compressionsActive: false,
                compressionsStartTime: null,
                totalCompressionsMs: totalCompressionsMs + sessionDuration,
                events: [
                    {
                        id: crypto.randomUUID(),
                        type: "COMPRESSION_PAUSE",
                        label: "Compressions Paused",
                        relativeTimeMs,
                        timestamp: now,
                    },
                    ...events,
                ]
            });
        } else {
            // Start / Resume
            const isResume = events.some(e => e.type === "COMPRESSION_PAUSE");
            set({
                compressionsActive: true,
                compressionsStartTime: now,
                events: [
                    {
                        id: crypto.randomUUID(),
                        type: isResume ? "COMPRESSION_RESUME" : "COMPRESSION_START",
                        label: isResume ? "Compressions Resumed" : "Compressions Started",
                        relativeTimeMs,
                        timestamp: now,
                    },
                    ...events,
                ]
            });
        }
    },

    undoLastEvent: () => {
        const { events, isActive } = get();
        if (!isActive || events.length === 0) return;

        // Cannot undo CODE_START
        const newestEvent = events[0];
        if (newestEvent.type === "CODE_START" || newestEvent.type === "CODE_END") return;

        const newEvents = events.slice(1);

        // Handle specific state rollbacks if needed (e.g. undoing Epi resets lastEpiTime)
        // For simplicity: if we undo EPI_GIVEN, we find the next most recent EPI_GIVEN
        let newLastEpiTime = get().lastEpiTime;
        if (newestEvent.type === "EPI_GIVEN") {
            const prevEpi = newEvents.find(e => e.type === "EPI_GIVEN");
            newLastEpiTime = prevEpi ? prevEpi.timestamp : null;
        }

        let newLastShockTime = get().lastShockTime;
        if (newestEvent.type === "SHOCK_ADMINISTERED") {
            const prevShock = newEvents.find(e => e.type === "SHOCK_ADMINISTERED");
            newLastShockTime = prevShock ? prevShock.timestamp : null;
        }

        // Undoing compressions start/pause requires reversing logic.
        // If we undo start/resume:
        let newCompressionsActive = get().compressionsActive;
        let newCompressionsStartTime = get().compressionsStartTime;

        if (newestEvent.type === "COMPRESSION_START" || newestEvent.type === "COMPRESSION_RESUME") {
            newCompressionsActive = false;
            newCompressionsStartTime = null;
        } else if (newestEvent.type === "COMPRESSION_PAUSE") {
            newCompressionsActive = true;
            // Have to guess start time. This is complex. We'll leave totalCompressionsMs as is for now 
            // or approximate by finding the last start.
            const lastStart = newEvents.find(e => e.type === "COMPRESSION_START" || e.type === "COMPRESSION_RESUME");
            newCompressionsStartTime = lastStart ? lastStart.timestamp : new Date();
        }

        set({
            events: newEvents,
            lastEpiTime: newLastEpiTime,
            lastShockTime: newLastShockTime,
            compressionsActive: newCompressionsActive,
            compressionsStartTime: newCompressionsStartTime,
        });
    },

    setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
    setLockMode: (locked) => set({ lockMode: locked }),
    updateSettings: (epiMins, pulseMins) => set({
        epiIntervalMs: epiMins * 60 * 1000,
        pulseIntervalMs: pulseMins * 60 * 1000
    }),
    showToast: (msg) => set({ alertToast: msg }),
    hideToast: () => set({ alertToast: null }),
}));
