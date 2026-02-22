import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
} from '@/utils/downloadFunctions';
import { SearchBar } from '@/components/ui/searchbar';
import { Skeleton } from '@/components/ui/skeleton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Progress } from '@/components/ui/progress';

export default function Download() {
  const [query, setQuery] = useState('');
  const [result, setResults] = useState<SearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [trackInput, setTrackInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { text, muted, card } = useThemeColors();

  const handleSearch = async () => {
    setLoading(true);
    setResults(await searchSong(query));
    setLoading(false);
  };

  useEffect(() => {
    makeDirectory();
  }, []);

  const handleDownload = async (
    item: SearchItem,
    track: string,
    artist: string,
  ) => {
    setDownloading(true);
    setProgress(0);
    await downloadSong(item, track, artist, setProgress);
    setDownloading(false);
  };

  return (
    <View className="flex-1 p-4 gap-3">
      <SearchBar
        placeholder="Search songs..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      {loading ? (
        <View className="gap-4 rounded-md">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="flex-row gap-3">
              <Skeleton width={80} height={80} style={{ borderRadius: 25 }} />
              <View className="flex-1 gap-2 pt-2">
                <Skeleton width={`75%`} height={16} />
                <Skeleton width={`50%`} height={16} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={result}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-1"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedItem(item);
                setTrackInput(item.track ?? item.title ?? '');
                setArtistInput(item.artist ?? item.uploader ?? '');
                setSheetOpen(true);
              }}
              className="flex-row items-center gap-3 my-2 p-3 rounded-2xl active:opacity-80"
              style={{ backgroundColor: card }}
            >
              <Image
                source={{ uri: item.thumbnail }}
                className="w-[70px] h-[70px] rounded-xl"
              />

              <View className="flex-1">
                <Text
                  numberOfLines={2}
                  className="text-[15px] font-semibold"
                  style={{ color: text }}
                >
                  {item.title}
                </Text>

                <Text className=" text-[13px] mt-1" style={{ color: muted }}>
                  {item.uploader}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

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
      {downloading && (
        <View className="absolute inset-0 justify-center items-center px-6 bg-black/60 ">
          <View
            className="w-full max-w-sm rounded-2xl p-6 pt-4 shadow-xl"
            style={{ backgroundColor: card }}
          >
            <Text
              className="text-lg font-semibol mb-4 text-center"
              style={{ color: text }}
            >
              Downloading...
            </Text>
            <Progress height={18} value={progress * 100} />
          </View>
        </View>
      )}
    </View>
  );
}
