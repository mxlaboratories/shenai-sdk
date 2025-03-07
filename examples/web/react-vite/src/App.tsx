import { ShenaiSDKProvider } from "./ShenaiContext";
import { ShenaiSDKView } from "./ShenaiSDKView";

function App() {
  return (
    <ShenaiSDKProvider>
      <ShenaiSDKView />
    </ShenaiSDKProvider>
  );
}

export default App;
