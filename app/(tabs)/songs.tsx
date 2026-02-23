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
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, useAlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Icon } from '@/components/ui/icon';
import { Heart } from 'lucide-react-native';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { loadQueue } = usePlayer();
  const { text, muted, card } = useThemeColors();
  const { isAlertVisible, openAlert, closeAlert } = useAlertDialog();
  const { success, warning } = useToast();

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
    await deleteSongs(selectedIds);
    success('Song Deleted!', 'The song has been deleted successfully.');

    setSelectMode(false);
    setSelectedIds([]);
    loadSongs();
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
            <Text className="font-medium" style={{ color: card }}>
              Select
            </Text>
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
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                />
              )}
            </Pressable>
          )}
        />
      </View>
      {selectMode && (
        <>
          <View className="absolute inset-0" pointerEvents="none" />
          <View
            className="absolute bottom-0 left-0 right-0 p-4 flex-row justify-around border-t"
            style={{ backgroundColor: card }}
          >
            <Button
              onPress={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
              size="sm"
            >
              <Text className="font-medium" style={{ color: card }}>
                Cancel
              </Text>
            </Button>
            <Button
              onPress={() => {
                if (selectedIds.length > 0) {
                  router.push({
                    pathname: '/screens/playlistSelector',
                    params: { songIds: JSON.stringify(selectedIds) },
                  });
                } else {
                  warning('Select Songs', 'Please select one or more songs');
                }
              }}
              variant="link"
              className="justify-center"
            >
              <Icon name={Heart} />
            </Button>
            <Button
              onPress={() => {
                if (selectedIds.length > 0) {
                  openAlert();
                } else {
                  warning('Select Songs', 'Please select one or more songs');
                }
              }}
              size="sm"
              style={{ backgroundColor: 'hsl(359, 71%, 58%)' }}
            >
              <Text className="font-medium" style={{ color: card }}>
                Delete
              </Text>
            </Button>
          </View>
          <AlertDialog
            title="Delete Song"
            description="Are you sure you want to delete the song? This action cannot be undone."
            isVisible={isAlertVisible}
            confirmText="Delete"
            onClose={closeAlert}
            onConfirm={handleDelete}
          />
        </>
      )}
    </>
  );
}
