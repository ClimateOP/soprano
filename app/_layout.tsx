import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PlayerProvider } from '@/context/playerContext';
import '@/global.css';
import { useEffect } from 'react';
import MiniPlayer from '../components/player/miniPlayer';
import { ThemeProvider } from '@/theme/theme-provider';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout() {
  const scheme = useColorScheme();
  const { card } = useThemeColors();

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  return (
    <ThemeProvider>
      <StatusBar
        style={scheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={card}
      />
      <ToastProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PlayerProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <MiniPlayer />
            </BottomSheetModalProvider>
          </PlayerProvider>
        </GestureHandlerRootView>
      </ToastProvider>
    </ThemeProvider>
  );
}
