import { useCodeSession } from "../store/useCodeSession";
import { format } from "date-fns";

export function Timeline() {
    const { events } = useCodeSession();

    const formatDurationMs = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case "CODE_START": return "border-red-500 text-red-500";
            case "EPI_GIVEN": return "border-blue-500 text-blue-400";
            case "SHOCK_ADMINISTERED": return "border-orange-500 text-orange-400";
            case "DRUG_ADMINISTERED": return "border-purple-500 text-purple-400";
            case "COMPRESSION_START":
            case "COMPRESSION_RESUME": return "border-green-500 text-green-400";
            case "COMPRESSION_PAUSE":
            case "COMPRESSION_STOP": return "border-yellow-500 text-yellow-500";
            default: return "border-slate-500 text-slate-300";
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-800 rounded-xl p-3 border border-slate-700 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 sticky top-0 bg-slate-800 pb-2 z-10 border-b border-slate-700">Timeline</h3>
            <div className="space-y-3">
                {events.map((event) => (
                    <div key={event.id} className={`pl-3 border-l-2 ${getEventColor(event.type)}`}>
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-slate-100">{event.label}</span>
                            <span className="text-xs font-mono text-slate-400">
                                {formatDurationMs(event.relativeTimeMs)}
                            </span>
                        </div>
                        {(event.details) && (
                            <div className="text-sm text-slate-300 mt-1">{event.details}</div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                            {format(event.timestamp, "HH:mm:ss")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
