import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  TextInput,
  BackHandler,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../context/playerContext';

type Song = {
  id: string;
  track: string;
  artist: string;
  fileUri: string;
  thumbnailUri: string;
};

export default function Songs() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { playSong } = usePlayer();

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
    const data = await AsyncStorage.getItem('songs');
    setSongs(data ? JSON.parse(data) : []);
  };

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, []),
  );

  const filtered = songs.filter((s) =>
    (s.track + '' + s.artist).toLowerCase().includes(query.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const deleteSongs = async () => {
    const remaining = songs.filter((s) => !selectedIds.includes(s.id));

    for (const s of songs) {
      if (selectedIds.includes(s.id)) {
        await FileSystem.deleteAsync(s.fileUri, { idempotent: true });
        await FileSystem.deleteAsync(s.thumbnailUri, { idempotent: true });
      }
    }

    await AsyncStorage.setItem('songs', JSON.stringify(remaining));
    setSongs(remaining);
    setSelectedIds([]);
    setSelectMode(false);
  };

  return (
    <>
      <View className="flex-row gap-2 p-4">
        <TextInput
          placeholder="Search song..."
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
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No Songs Downloaded</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                selectMode ? toggleSelect(item.id) : playSong(item)
              }
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
                <View>{selectedIds.includes(item.id) && <Text>✓</Text>}</View>
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
            <Pressable onPress={() => console.log('Playlists')}>
              <Text>❤️</Text>
            </Pressable>
            <Pressable onPress={deleteSongs}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}
