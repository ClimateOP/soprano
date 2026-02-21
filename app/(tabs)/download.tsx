import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import {
  SearchItem,
  searchSong,
  downloadSong,
  makeDirectory,
} from '../utils/downloadFunctions';

export default function Download() {
  const [query, setQuery] = useState('');
  const [result, setResults] = useState<SearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [trackInput, setTrackInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSearch = async () => {
    setResults(await searchSong(query));
  };

  useEffect(() => {
    makeDirectory();
  }, []);

  const handleDownload = async (
    item: SearchItem,
    track: string,
    artist: string,
  ) => {
    await downloadSong(item, track, artist);
  };

  return (
    <View className="flex-1 p-4 gap-3">
      <TextInput
        placeholder="Search Song..."
        value={query}
        onChangeText={setQuery}
        className="border p-3 rounded"
      />

      <Button title="Search" onPress={handleSearch} />

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
                  handleDownload(selectedItem, trackInput, artistInput);
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
