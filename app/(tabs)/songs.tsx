import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

export default function Songs() {
  const [songs, setSongs] = useState<string[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const dir = FileSystem.documentDirectory + 'songs/';

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    const files = await FileSystem.readDirectoryAsync(dir);
    setSongs(files);
  };

  const playSong = async (name: string) => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: s } = await Audio.Sound.createAsync({
      uri: dir + name,
    });

    setSound(s);
    await s.playAsync();
  };

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <Pressable onPress={() => playSong(item)} className="p-4 border-b">
          <Text>{item}</Text>
        </Pressable>
      )}
    />
  );
}
