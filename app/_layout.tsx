import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PlayerProvider } from './context/playerContext';
import '../global.css';
import { useEffect } from 'react';
import MiniPlayer from './components/miniPlayer';

export default function RootLayout() {
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <MiniPlayer />
        </BottomSheetModalProvider>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
