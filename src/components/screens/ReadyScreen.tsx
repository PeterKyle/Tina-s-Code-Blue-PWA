import { useState } from "react";
import { useCodeSession } from "../../store/useCodeSession";
import { Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { SettingsModal } from "../modals/SettingsModal";

export function ReadyScreen() {
    const { startCode } = useCodeSession();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto relative p-4 bg-slate-900">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2 text-blue-400">
                    <ShieldAlert className="w-8 h-8" />
                    <h1 className="text-xl font-bold tracking-tight">Code Blue Timer</h1>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition"
                    aria-label="Settings"
                >
                    <SettingsIcon className="w-6 h-6 text-slate-300" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <button
                    onClick={startCode}
                    className="w-64 h-64 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-3xl shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all transform active:scale-95 border-4 border-red-400/30 flex items-center justify-center"
                >
                    START CODE
                </button>
                <p className="mt-12 text-slate-400 text-sm flex items-center gap-2 text-center max-w-xs">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    HIPAA Friendly. No patient data is stored permanently.
                </p>
            </div>

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </div>
    );
}
