import React, { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  BackHandler,
} from 'react-native';
import { usePlayer } from '@/context/playerContext';
import { Song, getSongs, deleteSongs } from '@/utils/songFunctions';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/searchbar';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { loadQueue } = usePlayer();
  const { text, muted, card } = useThemeColors();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectMode) {
        setSelectMode(false);
        setSelectedIds([]);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [selectMode]);

  const loadSongs = async () => {
    setSongs(await getSongs());
  };

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, []),
  );

  const filteredSongs = songs.filter((s) =>
    (s.track + '' + s.artist).toLowerCase().includes(query.toLowerCase()),
  );

  const toggleSelect = (songId: string) => {
    setSelectedIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId],
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length > 0) {
      await deleteSongs(selectedIds);
      setSelectMode(false);
      setSelectedIds([]);
      loadSongs();
    } else {
      console.log('Select songs first pop up');
    }
  };

  return (
    <>
      <View className="flex-row gap-2 p-4">
        <View className="flex-1 mr-2">
          <SearchBar
            placeholder="Search songs..."
            value={query}
            onChangeText={setQuery}
            className="flex-1"
          />
        </View>
        {!selectMode && (
          <Button
            onPress={() => setSelectMode(true)}
            style={{ backgroundColor: muted }}
          >
            <Text style={{ color: card }}>Select</Text>
          </Button>
        )}
      </View>
      <View className="flex-1">
        <FlatList
          data={[...filteredSongs].reverse()}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text
                className="text-[15px] font-semibold text-center"
                style={{ color: muted }}
              >
                No downloaded songs
              </Text>
            </View>
          }
          contentContainerClassName="p-4"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (selectMode) {
                  toggleSelect(item.id);
                } else {
                  const index = filteredSongs.findIndex(
                    (s) => s.id === item.id,
                  );
                  loadQueue(filteredSongs, index);
                }
              }}
              className="flex-row items-center gap-3 my-2 p-3 rounded-2xl active:opacity-80"
              style={{ backgroundColor: card }}
            >
              <Image
                source={{ uri: item.thumbnailUri }}
                className="w-[70px] h-[70px] rounded-xl"
              />

              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className=" text-[15px] font-semibold"
                  style={{ color: text }}
                >
                  {item.track}
                </Text>
                <Text className="text-[13px] mt-1" style={{ color: muted }}>
                  {item.artist}
                </Text>
              </View>
              {selectMode && (
                <Text>{selectedIds.includes(item.id) ? '☑️' : '⬜'}</Text>
              )}
            </Pressable>
          )}
        />
      </View>
      {selectMode && (
        <>
          <View className="absolute inset-0" pointerEvents="none" />
          <View className="absolute bottom-0 left-0 right-0 bg-white p-4 flex-row justify-around border-t">
            <Pressable
              onPress={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/screens/playlistSelector',
                  params: { songIds: JSON.stringify(selectedIds) },
                })
              }
            >
              <Text>❤️</Text>
            </Pressable>
            <Pressable onPress={handleDelete}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}
