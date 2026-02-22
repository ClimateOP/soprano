import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import {
  Playlist,
  addSongsToPlaylists,
  getPlaylists,
} from '@/utils/playlistFunctions';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function PlaylistSelector() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { songIds } = useLocalSearchParams<{ songIds: string }>();
  const { text, muted, card } = useThemeColors();

  const parsedSongIds: string[] = JSON.parse(songIds || '[]');

  const loadPlaylists = async () => {
    setPlaylists(await getPlaylists());
  };

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, []),
  );

  const filteredLists = playlists.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length > 0) {
      await addSongsToPlaylists(selectedIds, parsedSongIds);
      setSelectedIds([]);
      router.back();
    } else {
      console.log('Select playlists first pop up');
    }
  };

  return (
    <View className="flex-1 mt-10">
      <View className="p-4">
        <SearchBar
          placeholder="Search Playlists..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View className="flex-1 px-2">
        <FlatList
          data={filteredLists}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No Playlists</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggleSelect(item.id)}
              className="flex-row items-center gap-3 my-2 p-6 rounded-2xl active:opacity-80 justify-between"
              style={{ backgroundColor: card }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={{ color: text }}
              >
                {item.name}
              </Text>
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => toggleSelect(item.id)}
              />
            </Pressable>
          )}
        />
      </View>

      <View
        className="p-4 flex-row justify-around border-t"
        style={{ backgroundColor: card }}
      >
        <Button onPress={() => router.back()} size="sm">
          <Text className="font-medium" style={{ color: card }}>
            Cancel
          </Text>
        </Button>
        <Button
          onPress={handleAdd}
          size="sm"
          style={{ backgroundColor: 'hsl(145, 84%, 32%)' }}
        >
          <Text className="font-medium" style={{ color: card }}>
            Save
          </Text>
        </Button>
      </View>
    </View>
  );
}
