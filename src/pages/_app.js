import { useEffect, useState } from "react";
import Head from "next/head";
import "antd/dist/antd.dark.css";
import "../assets/styles/app.css";
import PinGate from "../components/PinGate";
import Main from "../components/layout/Main";
import { getToken } from "../useAccount";

export default function App({ Component, pageProps }) {
  const [unlocked, setUnlocked] = useState(null); // null until localStorage is readable (client only)
  useEffect(() => {
    setUnlocked(!!getToken());
    const onLock = () => setUnlocked(false);
    window.addEventListener("locked", onLock);
    return () => window.removeEventListener("locked", onLock);
  }, []);

  return (
    <>
      <Head>
        <title>Jo Trade</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
      </Head>
      {unlocked === null ? null : !unlocked ? (
        <PinGate onUnlock={() => setUnlocked(true)} />
      ) : (
        <div className="App">
          <Main>
            <Component {...pageProps} />
          </Main>
        </div>
      )}
    </>
  );
}
