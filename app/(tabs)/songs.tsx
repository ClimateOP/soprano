import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const loadSongs = async () => {
    const data = await AsyncStorage.getItem('songs');
    setSongs(data ? JSON.parse(data) : []);
  };

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, []),
  );

  const playSong = async (uri: string) => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: s } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
    );

    setSound(s);
  };

  const filtered = songs.filter((s) =>
    (s.track + '' + s.artist).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View className="flex-1 p-4">
      <TextInput
        placeholder="Search song..."
        value={query}
        onChangeText={setQuery}
        className="border p-3 rounded mb-2"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No Songs Downloaded</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => playSong(item.fileUri)}
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
          </Pressable>
        )}
      />
    </View>
  );
}
