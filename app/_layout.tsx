import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import '../global.css';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
