"use client";

import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const MainApp = dynamic(() => import("~/components/MainApp").then(mod => ({ default: mod.MainApp })), {
  ssr: false,
});

export default function App() {
  return <MainApp />;
}
