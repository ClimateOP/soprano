import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable } from 'react-native';
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
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function Download() {
  const [query, setQuery] = useState('');
  const [result, setResults] = useState<SearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [trackInput, setTrackInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { text, muted, card } = useThemeColors();
  const { isVisible, open, close } = useBottomSheet();
  const { success, error } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchSong(query);
      setResults(data);
    } catch (err) {
      error(
        'Search Failed',
        'Could not connect to the server, please restart Termux and try again.',
      );
      setResults([]);
    }
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
    try {
      await downloadSong(item, track, artist, setProgress);
      success('Song Downloaded!', 'The song has been downloaded successfully.');
    } catch (err) {
      error(
        'Download Failed',
        'Could not download the song. Please restart Termux and try again.',
      );
    }
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
                open();
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

      <BottomSheet isVisible={isVisible} onClose={close} snapPoints={[0.27]}>
        <View className="gap-2">
          <Text className="text-lg font-semibold" style={{ color: text }}>
            Download Song
          </Text>

          <View className="flex-column">
            <Input
              autoFocus
              label="Title"
              placeholder="Enter title..."
              value={trackInput}
              onChangeText={setTrackInput}
              className="border rounded-lg mb-2"
              inputStyle={{ fontSize: 15, borderColor: muted }}
            />
            <Input
              label="Artist"
              placeholder="Enter artist..."
              value={artistInput}
              onChangeText={setArtistInput}
              className="border rounded-lg mb-2"
              inputStyle={{ fontSize: 15, borderColor: muted }}
            />
          </View>

          <View className="flex-row justify-around">
            <Button onPress={close} size="sm">
              <Text className="font-medium" style={{ color: card }}>
                Cancel
              </Text>
            </Button>
            <Button
              onPress={() => {
                close();
                if (selectedItem) {
                  handleDownload(selectedItem, trackInput, artistInput);
                }
              }}
              style={{ backgroundColor: 'hsl(145, 84%, 32%)' }}
              size="sm"
            >
              <Text className="font-medium" style={{ color: card }}>
                Download
              </Text>
            </Button>
          </View>
        </View>
      </BottomSheet>

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
