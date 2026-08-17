"use client";

import { AppProvider, useApp } from "@/contexts/AppContext";
import { DebugProvider } from "@/contexts/DebugContext";
import { ScreenTransition } from "@/components/shared/ScreenTransition";
import { ProfileSelect } from "@/components/screens/ProfileSelect";
import { ControlTower } from "@/components/screens/ControlTower";
import { RadarRoom } from "@/components/screens/RadarRoom";
import { RadioContact } from "@/components/screens/RadioContact";
import { CaptainStory } from "@/components/screens/CaptainStory";
import { FlightLog } from "@/components/screens/FlightLog";
import { DebugPanel } from "@/components/debug/DebugPanel";

function AppScreens() {
  const { currentScreen } = useApp();

  const screens = {
    "profile-select": <ProfileSelect />,
    "control-tower": <ControlTower />,
    "radar-room": <RadarRoom />,
    "radio-contact": <RadioContact />,
    "captain-story": <CaptainStory />,
    "flight-log": <FlightLog />,
  };

  return (
    <main className="h-dvh w-full max-w-md mx-auto overflow-hidden relative">
      <ScreenTransition screenKey={currentScreen}>
        {screens[currentScreen]}
      </ScreenTransition>
    </main>
  );
}

export default function Home() {
  return (
    <DebugProvider>
      <AppProvider>
        <AppScreens />
        <DebugPanel />
      </AppProvider>
    </DebugProvider>
  );
}
