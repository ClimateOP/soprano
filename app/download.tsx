import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SearchItem = {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  url: string;
  track: string;
  artist: string;
  webpage_url: string;
};

const SONG_DIR = FileSystem.documentDirectory + 'songs/';

export default function Download() {
  const [query, setQuery] = useState('');
  const [result, setResults] = useState<SearchItem[]>([]);

  const search = async () => {
    const res = await fetch(
      `http://192.168.100.8:3000/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      FileSystem.makeDirectoryAsync(SONG_DIR, { intermediates: true });
    }
  }, []);

  const downloadSong = async (item: SearchItem) => {
    const fileUri = SONG_DIR + item.id + '.mp3';

    await FileSystem.downloadAsync(
      `http://192.168.100.8:3000/download?url=${encodeURIComponent(item.webpage_url)}`,
      fileUri,
    );

    const stored = JSON.parse((await AsyncStorage.getItem('songs')) || '[]');

    stored.push({
      id: item.id,
      track: item.track || item.title,
      artist: item.artist || item.uploader,
      fileUri,
      thumbnail: item.thumbnail,
      playlists: [],
    });

    AsyncStorage.setItem('songs', JSON.stringify(stored));

    console.log('Downloaded', fileUri);

    //checking
    console.log(FileSystem.documentDirectory);

    const dir = FileSystem.documentDirectory + 'songs/';

    const files = await FileSystem.readDirectoryAsync(dir);
    console.log('Songs Folder:', files);

    const info = await FileSystem.getInfoAsync(dir + files[0]);
    console.log(info);
  };

  return (
    <View className="flex-1 p-4 gap-3">
      <TextInput
        placeholder="Search song..."
        value={query}
        onChangeText={setQuery}
        className="border p-3 rounded"
      />

      <Button title="Search" onPress={search} />

      <FlatList
        data={result}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row gap-3 my-2">
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: 80, height: 80 }}
            />
            <View className="flex-1">
              <Text numberOfLines={2}>{item.title}</Text>
              <Text>{item.uploader}</Text>
            </View>
            <Pressable
              onPress={() => downloadSong(item)}
              className="bg-blue-500 p-2 mt-2 rounded"
            >
              <Text className="text-white text-center">Download</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
