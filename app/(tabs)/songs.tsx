import React, { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  TextInput,
  BackHandler,
} from 'react-native';
import { usePlayer } from '../context/playerContext';

import { Song, getSongs, deleteSongs } from '../utils/songFunctions';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { loadQueue } = usePlayer();

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
        <TextInput
          placeholder="Search Song..."
          value={query}
          onChangeText={setQuery}
          className="border p-3 rounded flex-1"
        />
        {!selectMode && (
          <Pressable
            onPress={() => setSelectMode(true)}
            className="bg-gray-300 px-4 justify-center rounded"
          >
            <Text>Select</Text>
          </Pressable>
        )}
      </View>
      <View className="flex-1 p-2">
        <FlatList
          data={[...filteredSongs].reverse()}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No Songs Downloaded</Text>}
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
              className="flex-row gap-3 my-2 bg-white p-2 rounded"
            >
              <Image
                source={{ uri: item.thumbnailUri }}
                style={{ width: 70, height: 70 }}
              />

              <View className="flex-1">
                <Text numberOfLines={1}>{item.track}</Text>
                <Text>{item.artist}</Text>
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
