import { Timer } from "./components/Timer";
import TimerContextProvider from "./context/TimerContextProvider";

function App() {
  return (
    <main className="w-full flex justify-center min-h-screen font-protest">
      <TimerContextProvider>
        <Timer />
      </TimerContextProvider>
    </main>
  );
}

export default App;
