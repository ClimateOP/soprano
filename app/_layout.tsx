import { Tabs } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="songs" options={{ title: 'Songs' }} />
      <Tabs.Screen name="playlists" options={{ title: 'Playlists' }} />
      <Tabs.Screen name="download" options={{ title: 'Download' }} />
    </Tabs>
  );
}
