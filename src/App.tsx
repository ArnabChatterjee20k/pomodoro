import Settings from "./components/Settings";
import { Timer } from "./components/Timer";

function App() {
  return (
    <main className="w-full flex flex-col items-center min-h-screen font-protest">
      <Settings/>
      <Timer />
    </main>
  );
}

export default App;
