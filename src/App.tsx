import { useCodeSession } from "./store/useCodeSession";
import { ReadyScreen } from "./components/screens/ReadyScreen";
import { ActiveCodeScreen } from "./components/screens/ActiveCodeScreen";
import { SummaryScreen } from "./components/screens/SummaryScreen";
import { useVibrationAlerts } from "./hooks/useVibrationAlerts";

function App() {
  const { isActive, endTime } = useCodeSession();

  // Initialize vibration alerts loop
  useVibrationAlerts();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Show summary if code has ended */}
      {!isActive && endTime && <SummaryScreen />}

      {/* Show active code if running */}
      {isActive && !endTime && <ActiveCodeScreen />}

      {/* Show ready screen if not running and no end time */}
      {!isActive && !endTime && <ReadyScreen />}
    </div>
  );
}

export default App;
