"use client";

import { useEffect, useRef, useState } from "react";
import BrowserTaskArea, { type BrowserTaskAreaHandle } from "@/components/BrowserTaskArea";
import CopilotPanel from "@/components/CopilotPanel";

export default function HomeShell() {
  const browserAreaRef = useRef<BrowserTaskAreaHandle | null>(null);
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [currentPageTitle, setCurrentPageTitle] = useState("Google");
  const [panelOpen, setPanelOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bananaTask =
    "Open https://www.google.com and search for banana. Stop on the results page before clicking anything else.";
  const pharmacyTask =
    "Go to my pharmacy website and look for refill options. Trace the path to the refill, prescription status, or contact page, and stop before submitting anything.";

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openPanel = () => {
    if (closing) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(false);
    }
    setPanelOpen(true);
  };

  const closePanel = () => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setPanelOpen(false);
      setClosing(false);
    }, 200);
  };

  const runPharmacyTrace = () => {
    browserAreaRef.current?.runTask(pharmacyTask);
  };

  const openBananaTest = () => {
    browserAreaRef.current?.runTask(bananaTask);
  };

  return (
    <div className="app-shell">
      <div className="home-stage">
        <BrowserTaskArea
          ref={browserAreaRef}
          currentUrl={currentUrl}
          currentPageTitle={currentPageTitle}
          onUrlChange={setCurrentUrl}
          onPageTitleChange={setCurrentPageTitle}
          onOpenAssistant={openPanel}
        />
      </div>

      {panelOpen && (
        <div className={`overlay-panel${closing ? " overlay-panel-closing" : ""}`}>
          <CopilotPanel
            currentUrl={currentUrl}
            currentPageTitle={currentPageTitle}
            onClose={closePanel}
            onNavigateBanana={openBananaTest}
            onRunPharmacyTrace={runPharmacyTrace}
          />
        </div>
      )}

      <button
        className="fab"
        onClick={openPanel}
        aria-label="Open SafeStep"
        title="Open SafeStep"
      >
        🦮
      </button>
    </div>
  );
}
