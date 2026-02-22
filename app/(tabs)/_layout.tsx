import { Tabs } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Icon } from '@/components/ui/icon';
import { Download, ListMusic, Music } from 'lucide-react-native';

export default function RootLayout() {
  const { text, muted } = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: text,
        tabBarInactiveTintColor: muted,
      }}
    >
      <Tabs.Screen
        name="songs"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color }) => <Icon name={Music} color={color} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color }) => <Icon name={ListMusic} color={color} />,
        }}
      />
      <Tabs.Screen
        name="download"
        options={{
          title: 'Download',
          tabBarIcon: ({ color }) => <Icon name={Download} color={color} />,
        }}
      />
    </Tabs>
  );
}
