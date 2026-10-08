import { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import DataEntry from "./pages/DataEntry";
import PinGate from "./components/PinGate";
import { getToken } from "./useAccount";
import Main from "./components/layout/Main";
import "antd/dist/antd.dark.css";
import "./assets/styles/app.css";

// Auth routes (/sign-in, /sign-up) are hidden for now; pages still exist in ./pages.
function App() {
  const [unlocked, setUnlocked] = useState(!!getToken());
  useEffect(() => {
    const onLock = () => setUnlocked(false);
    window.addEventListener("locked", onLock);
    return () => window.removeEventListener("locked", onLock);
  }, []);

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return (
    <div className="App">
      <Main>
        <Switch>
          <Route exact path="/dashboard" component={Home} />
          <Route exact path="/data-entry" component={DataEntry} />
          <Redirect from="*" to="/dashboard" />
        </Switch>
      </Main>
    </div>
  );
}

export default App;
