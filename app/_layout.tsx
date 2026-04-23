import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DrawerProvider } from "../src/components/navigation/DrawerProvider";
import { AppLoader } from "../src/components/ui/AppLoader";

export default function RootLayout() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsBooting(false), 1200);
    return () => clearTimeout(timeout);
  }, []);

  if (isBooting) {
    return (
      <>
        <StatusBar style="light" />
        <AppLoader />
      </>
    );
  }

  return (
    <DrawerProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </DrawerProvider>
  );
}
