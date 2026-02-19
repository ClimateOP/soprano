import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Pressable,
  Platform,
  Modal,
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [trackInput, setTrackInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const search = async () => {
    const res = await fetch(
      `http://192.168.100.3:3000/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      FileSystem.makeDirectoryAsync(SONG_DIR, { intermediates: true });
    }
  }, []);

  const downloadSong = async (
    item: SearchItem,
    track: string,
    artist: string,
  ) => {
    const fileUri = SONG_DIR + item.id + '.mp3';
    const thumbnailUri = SONG_DIR + item.id + '.jpg';

    await FileSystem.downloadAsync(
      `http://192.168.100.3:3000/download?url=${encodeURIComponent(item.webpage_url)}`,
      fileUri,
    );
    await FileSystem.downloadAsync(item.thumbnail, thumbnailUri);

    const stored = JSON.parse((await AsyncStorage.getItem('songs')) || '[]');

    stored.push({
      id: item.id,
      track,
      artist,
      fileUri,
      thumbnailUri,
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
        placeholder="Search Song..."
        value={query}
        onChangeText={setQuery}
        className="border p-3 rounded"
      />

      <Button title="Search" onPress={search} />

      <FlatList
        data={result}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row gap-3 my-2"
            onPress={() => {
              console.log('ROW PRESSED');
              setSelectedItem(item);
              setTrackInput(item.track ?? item.title ?? '');
              setArtistInput(item.artist ?? item.uploader ?? '');
              setSheetOpen(true);
            }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: 80, height: 80 }}
            />
            <View className="flex-1">
              <Text numberOfLines={2}>{item.title}</Text>
              <Text>{item.uploader}</Text>
            </View>
          </Pressable>
        )}
      />
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setSheetOpen(false)}
        >
          <Pressable
            className="bg-white p-4 gap-3 rounded-t-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <Text>Title</Text>
            <TextInput
              value={trackInput}
              onChangeText={setTrackInput}
              className="border p-2 rounded"
            />

            <Text>Artist</Text>
            <TextInput
              value={artistInput}
              onChangeText={setArtistInput}
              className="border p-2 rounded"
            />

            <Pressable
              className="bg-red-400 p-3 rounded"
              onPress={() => setSheetOpen(false)}
            >
              <Text>Cancel</Text>
            </Pressable>

            <Pressable
              className="bg-blue-500 p-3 rounded"
              onPress={() => {
                setSheetOpen(false);
                if (selectedItem) {
                  downloadSong(selectedItem, trackInput, artistInput);
                }
              }}
            >
              <Text className="text-white text-center">Download</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
