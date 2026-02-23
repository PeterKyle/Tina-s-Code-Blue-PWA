import { useState } from "react";
import { useCodeSession } from "../../store/useCodeSession";
import { X, Save } from "lucide-react";

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const {
        vibrationEnabled,
        setVibrationEnabled,
        epiIntervalMs,
        pulseIntervalMs,
        updateSettings
    } = useCodeSession();

    const [epiMins, setEpiMins] = useState(epiIntervalMs / 60000);
    const [pulseMins, setPulseMins] = useState(pulseIntervalMs / 60000);

    const handleSave = () => {
        updateSettings(epiMins, pulseMins);
        onClose();
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-center animation-fade-in">
            <div className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden border border-slate-700 shadow-2xl relative">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Timer Settings</h2>
                    <button onClick={onClose} className="p-2 bg-slate-700 rounded-full text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <div className="font-bold text-white">Vibration Alerts</div>
                            <div className="text-sm text-slate-400 leading-tight">Vibrate device when Epi or Pulse timers are due.</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={vibrationEnabled}
                            onChange={(e) => setVibrationEnabled(e.target.checked)}
                            className="w-6 h-6 accent-blue-500 bg-slate-900 border-slate-600 rounded"
                        />
                    </label>

                    <div>
                        <div className="font-bold text-white mb-2">Epinephrine Interval (Minutes)</div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1" max="10" step="1"
                                value={epiMins}
                                onChange={(e) => setEpiMins(Number(e.target.value))}
                                className="flex-1 accent-blue-500"
                            />
                            <div className="font-mono text-xl font-bold text-blue-400 w-8">{epiMins}m</div>
                        </div>
                    </div>

                    <div>
                        <div className="font-bold text-white mb-2">Pulse Check Interval (Minutes)</div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1" max="5" step="1"
                                value={pulseMins}
                                onChange={(e) => setPulseMins(Number(e.target.value))}
                                className="flex-1 accent-orange-500"
                            />
                            <div className="font-mono text-xl font-bold text-orange-400 w-8">{pulseMins}m</div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="mt-4 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
