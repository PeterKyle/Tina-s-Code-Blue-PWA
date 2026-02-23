import { useCodeSession } from "../../store/useCodeSession";
import { ClipboardCopy, RotateCcw, ShieldCheck } from "lucide-react";

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function SummaryScreen() {
    const { startTime, endTime, events, totalCompressionsMs } = useCodeSession();

    if (!startTime || !endTime) return null;

    const codeDurationMs = endTime.getTime() - startTime.getTime();

    const epiDoses = events.filter(e => e.type === "EPI_GIVEN").length;
    const shocks = events.filter(e => e.type === "SHOCK_ADMINISTERED").length;

    const handleCopy = () => {
        const text = `
CODE SUMMARY
Date: ${startTime.toLocaleDateString()}
Code Duration: ${formatDuration(codeDurationMs)}
Total Compressions Time: ${formatDuration(totalCompressionsMs)}
Epinephrine Doses: ${epiDoses}
Shocks Delivered: ${shocks}

TIMELINE:
${events.slice().reverse().map(e => `[${formatDuration(e.relativeTimeMs)}] ${e.timestamp.toLocaleTimeString()} - ${e.label} ${e.details || ''}`).join('\n')}
    `.trim();
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!\nReminder: Do not paste PHI alongside this log in insecure areas.");
    };

    const handleReset = () => {
        // A full page reload is safest to clear memory strictly (HIPAA-friendly)
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-900 p-4 overflow-y-auto pb-24 text-slate-200">
            <div className="py-4 border-b border-slate-700 mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Code Summary</h1>
                <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-sm text-slate-400">Duration</div>
                    <div className="text-3xl font-bold text-white">{formatDuration(codeDurationMs)}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-sm text-slate-400">Compressions</div>
                    <div className="text-3xl font-bold text-white">{formatDuration(totalCompressionsMs)}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-sm text-slate-400">Epinephrine</div>
                    <div className="text-3xl font-bold text-blue-400">{epiDoses} doses</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-sm text-slate-400">Shocks</div>
                    <div className="text-3xl font-bold text-orange-400">{shocks} delivered</div>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">Timeline Log</h2>
            <div className="space-y-3 mb-8">
                {events.slice().map(e => (
                    <div key={e.id} className="flex gap-3 bg-slate-800/50 p-2 rounded">
                        <div className="text-slate-400 text-sm whitespace-nowrap">
                            {formatDuration(e.relativeTimeMs)}
                        </div>
                        <div>
                            <div className="font-semibold">{e.label}</div>
                            {e.details && <div className="text-sm text-slate-400">{e.details}</div>}
                        </div>
                        <div className="ml-auto text-xs text-slate-500">
                            {e.timestamp.toLocaleTimeString([], { hour12: false })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 max-w-md mx-auto grid grid-cols-2 gap-3">
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-semibold"
                >
                    <ClipboardCopy className="w-5 h-5" /> Copy Log
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg font-semibold"
                >
                    <RotateCcw className="w-5 h-5" /> New Patient
                </button>
            </div>
        </div>
    );
}
