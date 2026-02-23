import { useState, useEffect } from "react";
import { useCodeSession } from "../../store/useCodeSession";
import { Timeline } from "../Timeline";
import { format } from "date-fns";
import { Activity, Syringe, Zap, Undo2, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { EventModal } from "../modals/EventModal";

export function ActiveCodeScreen() {
    const {
        startTime,
        endCode,
        lastEpiTime,
        logEpi,
        lastPulseCheckTime,
        logPulseCheck,
        lastShockTime,
        compressionsActive,
        toggleCompressions,
        undoLastEvent,
        lockMode,
        setLockMode
    } = useCodeSession();

    const [now, setNow] = useState(new Date());
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [modalType, setModalType] = useState<"drug" | "rhythm" | "shock" | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimer = (start: Date | null, currentTime: Date) => {
        if (!start) return "00:00";
        const diff = currentTime.getTime() - start.getTime();
        if (diff < 0) return "00:00";
        const m = Math.floor(diff / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEndCode = () => {
        if (lockMode) return;
        if (showEndConfirm) endCode();
        else setShowEndConfirm(true);
    };

    const handleEpi = () => {
        if (lockMode) return;
        logEpi();
    };

    const handlePulse = () => {
        if (lockMode) return;
        logPulseCheck();
    };

    const codeDurationStr = formatTimer(startTime, now);
    const epiTimeStr = formatTimer(lastEpiTime, now);
    const pulseTimeStr = formatTimer(lastPulseCheckTime, now);
    const shockTimeStr = formatTimer(lastShockTime, now);

    const isEpiDue = lastEpiTime && (now.getTime() - lastEpiTime.getTime() >= 3 * 60 * 1000); // Highlight red if due
    const isPulseDue = lastPulseCheckTime && (now.getTime() - lastPulseCheckTime.getTime() >= 2 * 60 * 1000);

    return (
        <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-900 overflow-hidden relative">
            {/* HEADER */}
            <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-900">
                <div className="flex gap-3 items-center">
                    <div className="text-3xl font-bold text-red-500 tabular-nums tracking-tighter w-[85px]">
                        {codeDurationStr}
                    </div>
                    <div className="text-xs text-slate-500 leading-tight">
                        Code Time
                        <br />
                        {format(now, "HH:mm:ss")}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setLockMode(!lockMode)}
                        className={`p-2 rounded-full ${lockMode ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {lockMode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={handleEndCode}
                        className={`px-3 py-1 font-bold rounded-lg transition-colors ${lockMode ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-red-900/50 hover:bg-red-800 text-red-500 border border-red-800/50'}`}
                    >
                        {showEndConfirm ? "CONFIRM END" : "END"}
                    </button>
                </div>
            </div>

            {/* TIMERS ROW */}
            <div className="grid grid-cols-3 gap-2 p-3">
                {/* Epi Button */}
                <button
                    onClick={handleEpi}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-transform active:scale-95
            ${lockMode ? 'opacity-50 border-slate-700 bg-slate-800' :
                            isEpiDue ? 'border-blue-400 bg-blue-900/50 animate-pulse' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Last Epi</div>
                    <div className={`text-2xl font-bold tabular-nums leading-none mb-1 ${isEpiDue ? 'text-blue-300' : 'text-white'}`}>
                        {epiTimeStr}
                    </div>
                    <div className="text-[9px] text-blue-400 font-semibold bg-blue-400/10 px-2 py-0.5 rounded-full">
                        GIVE EPI
                    </div>
                </button>

                {/* Pulse Check Button */}
                <button
                    onClick={handlePulse}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-transform active:scale-95
            ${lockMode ? 'opacity-50 border-slate-700 bg-slate-800' :
                            isPulseDue ? 'border-orange-400 bg-orange-900/50 animate-pulse' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pulse</div>
                    <div className={`text-2xl font-bold tabular-nums leading-none mb-1 ${isPulseDue ? 'text-orange-300' : 'text-white'}`}>
                        {pulseTimeStr}
                    </div>
                    <div className="text-[9px] text-orange-400 font-semibold bg-orange-400/10 px-2 py-0.5 rounded-full">
                        CHECK
                    </div>
                </button>

                {/* Compressions Button */}
                <button
                    onClick={() => { if (!lockMode) toggleCompressions(); }}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-transform active:scale-95
            ${lockMode ? 'opacity-50 border-slate-700 bg-slate-800' :
                            compressionsActive ? 'border-green-500 bg-green-900/30' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">CPR</div>
                    <div className="text-xl font-bold leading-none mb-2 text-white">
                        {compressionsActive ? "ON" : "OFF"}
                    </div>
                    <div className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${compressionsActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}`}>
                        {compressionsActive ? "PAUSE" : "START"}
                    </div>
                </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-3 gap-2 px-3 pb-3 border-b border-slate-800">
                <button
                    onClick={() => { if (!lockMode) setModalType("drug") }}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center gap-1 bg-purple-900/30 text-purple-400 py-2 rounded-lg border border-purple-900/50 ${lockMode ? 'opacity-50' : 'hover:bg-purple-800/40 text-purple-300'} h-full`}
                >
                    <Syringe className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold text-center leading-tight mt-auto">Drug/<br />Med</span>
                </button>

                <button
                    onClick={() => { if (!lockMode) setModalType("rhythm") }}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center gap-1 bg-green-900/30 text-green-400 py-2 rounded-lg border border-green-900/50 ${lockMode ? 'opacity-50' : 'hover:bg-green-800/40 text-green-300'} h-full`}
                >
                    <Activity className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase font-bold text-center leading-tight mt-auto">Rhythm/<br />Goal</span>
                </button>

                <button
                    onClick={() => { if (!lockMode) setModalType("shock") }}
                    disabled={lockMode}
                    className={`flex flex-col items-center justify-center bg-orange-900/30 text-orange-400 py-2 rounded-lg border border-orange-900/50 ${lockMode ? 'opacity-50' : 'hover:bg-orange-800/40 text-orange-300'} h-full`}
                >
                    <div className="flex items-center gap-1 mb-1">
                        <Zap className={lastShockTime ? "w-4 h-4" : "w-5 h-5"} />
                        {lastShockTime && <span className="font-mono text-sm font-bold text-orange-200 leading-none">{shockTimeStr}</span>}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-center leading-tight mt-auto">Defib/<br />Shock</span>
                </button>
            </div>

            {/* TIMELINE */}
            <div className="flex-1 overflow-hidden p-3 flex flex-col min-h-0 relative">
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={undoLastEvent}
                        disabled={lockMode}
                        className={`p-2 bg-slate-800 rounded-full border border-slate-700 transition ${lockMode ? 'opacity-50' : 'hover:bg-slate-700 active:bg-slate-600'}`}
                    >
                        <Undo2 className="w-4 h-4 text-slate-300" />
                    </button>
                </div>
                <Timeline />
            </div>

            {/* MODALS */}
            {modalType && (
                <EventModal
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}

            {showEndConfirm && (
                <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-slate-700 text-center shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">End Code Session?</h2>
                        <p className="text-slate-400 mb-6 text-sm">All timers will stop. You will be taken to the summary screen to copy the timeline log.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 py-3 px-4 bg-slate-700 text-white rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={endCode}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex gap-2 justify-center items-center"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
