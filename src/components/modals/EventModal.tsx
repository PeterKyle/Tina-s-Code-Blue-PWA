import { useState } from "react";
import { useCodeSession } from "../../store/useCodeSession";
import { DRUGS_LIST, RHYTHM_GOAL_LIST, SHOCK_ENERGIES } from "../../config/clinicalData";
import { X, CheckCircle2 } from "lucide-react";

interface EventModalProps {
    type: "drug" | "rhythm" | "shock";
    onClose: () => void;
}

export function EventModal({ type, onClose }: EventModalProps) {
    const { logEvent } = useCodeSession();
    const [selectedItem, setSelectedItem] = useState("");
    const [customText, setCustomText] = useState("");
    const [selectedDose, setSelectedDose] = useState("");

    const selectedDrug = type === "drug" ? DRUGS_LIST.find(d => d.name === selectedItem) : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem && !customText) return;

        if (type === "drug") {
            const name = customText || selectedItem;
            const dose = selectedDose ? ` ${selectedDose}` : "";
            logEvent("DRUG_ADMINISTERED", "Drug Administered", `${name}${dose}`);
        } else if (type === "rhythm") {
            logEvent("RHYTHM_EVENT", "Event/Rhythm", customText || selectedItem);
        } else if (type === "shock") {
            const energy = customText ? `${customText}J` : selectedItem;
            logEvent("SHOCK_ADMINISTERED", "Shock Delivered", energy);
        }

        onClose();
    };

    const getTitle = () => {
        if (type === "drug") return "Log Drug / Medication";
        if (type === "rhythm") return "Log Rhythm / Goal";
        return "Log Defribillation / Shock";
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm p-4 flex flex-col pt-16 animation-fade-in">
            <div className="bg-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden border border-slate-700 shadow-2xl relative">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
                    <button onClick={onClose} className="p-2 bg-slate-700 rounded-full text-slate-300 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">

                    {type === "drug" && (
                        <>
                            <div className="text-sm font-semibold text-slate-400">Select Drug</div>
                            <div className="grid grid-cols-2 gap-2">
                                {DRUGS_LIST.map((drug) => (
                                    <button
                                        key={drug.id}
                                        type="button"
                                        onClick={() => { setSelectedItem(drug.name); setSelectedDose(drug.defaultDoses[0] || ""); setCustomText(""); }}
                                        className={`p-3 rounded-xl border text-left font-semibold transition ${selectedItem === drug.name ? 'border-purple-500 bg-purple-900/50 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700'}`}
                                    >
                                        {drug.name}
                                    </button>
                                ))}
                            </div>

                            {selectedDrug && selectedDrug.defaultDoses.length > 0 && (
                                <div className="mt-2">
                                    <div className="text-sm font-semibold text-slate-400 mb-2">Select Dose</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedDrug.defaultDoses.map((dose) => (
                                            <button
                                                key={dose}
                                                type="button"
                                                onClick={() => setSelectedDose(dose)}
                                                className={`px-4 py-2 rounded-lg border font-semibold ${selectedDose === dose ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-600 bg-slate-800 text-slate-400'}`}
                                            >
                                                {dose}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {type === "rhythm" && (
                        <>
                            <div className="text-sm font-semibold text-slate-400">Select Rhythm / Goal</div>
                            <div className="grid grid-cols-2 gap-2">
                                {RHYTHM_GOAL_LIST.map((rhythm) => (
                                    <button
                                        key={rhythm}
                                        type="button"
                                        onClick={() => { setSelectedItem(rhythm); setCustomText(""); }}
                                        className={`p-3 rounded-xl border text-left font-semibold text-sm transition ${selectedItem === rhythm ? 'border-green-500 bg-green-900/50 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700'}`}
                                    >
                                        {rhythm}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {type === "shock" && (
                        <>
                            <div className="text-sm font-semibold text-slate-400">Select Energy Profile</div>
                            <div className="grid grid-cols-3 gap-2">
                                {SHOCK_ENERGIES.map((energy) => (
                                    <button
                                        key={energy}
                                        type="button"
                                        onClick={() => { setSelectedItem(energy); setCustomText(""); }}
                                        className={`p-4 rounded-xl border text-center font-bold text-lg transition ${selectedItem === energy ? 'border-orange-500 bg-orange-900/50 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700'}`}
                                    >
                                        {energy}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <div className="text-sm font-semibold text-slate-400 mb-2">Or Enter Other/Custom</div>
                        <input
                            type={type === "shock" ? "number" : "text"}
                            placeholder={type === "shock" ? "Custom Joules..." : "Type custom entry..."}
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={customText}
                            onChange={(e) => {
                                setCustomText(e.target.value);
                                setSelectedItem("");
                            }}
                        />
                        {type === "drug" && (
                            <p className="text-xs text-orange-400 mt-2 font-semibold flex gap-1 items-center">
                                ⚠ Do not enter patient identifiers (PHI)
                            </p>
                        )}
                    </div>

                    <div className="mt-auto pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 rounded-xl bg-slate-700 text-white font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedItem && !customText}
                            className="flex-1 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-bold flex justify-center items-center gap-2"
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            Log Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
