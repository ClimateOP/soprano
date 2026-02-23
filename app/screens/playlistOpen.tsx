import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { usePlayer } from '@/context/playerContext';
import { Song, deleteSongs, getSongs } from '@/utils/songFunctions';
import {
  Playlist,
  getPlaylists,
  removeSongsfromPlaylists,
} from '@/utils/playlistFunctions';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { AlertDialog, useAlertDialog } from '@/components/ui/alert-dialog';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';

export default function PlaylistOpen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogType, setDialogType] = useState<'remove' | 'delete' | null>(
    null,
  );
  const { loadQueue } = usePlayer();
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const loadData = async () => {
    const allSongs = await getSongs();
    const allPlaylists = await getPlaylists();

    const found = allPlaylists.find((p) => p.id === id) || null;
    setPlaylist(found);

    if (found) {
      setSongs(allSongs.filter((s) => found.songIds.includes(s.id)));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id]),
  );

  const filteredSongs = songs.filter((s) =>
    (s.track + s.artist).toLowerCase().includes(query.toLocaleLowerCase()),
  );

  const toggleSelect = (songId: string) => {
    setSelectedIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId],
    );
  };

  const handleRemove = async () => {
    if (playlist) {
      await removeSongsfromPlaylists([playlist.id], selectedIds);
      success(
        'Song Removed!',
        'The song has been removed from the playlist successfully.',
      );

      setSelectMode(false);
      setSelectedIds([]);
      loadData();
    }
  };

  const handleDelete = async () => {
    await deleteSongs(selectedIds);
    success('Song Deleted!', 'The song has been deleted successfully.');
    setSelectMode(false);
    setSelectedIds([]);
    loadData();
  };

  return (
    <View className="flex-1 mt-10">
      <View className="flex-row items-center justify-center gap-3 p-6">
        <Button
          onPress={() => router.back()}
          variant="outline"
          size="sm"
          className="absolute left-3"
        >
          <Icon name={ArrowLeft} />
        </Button>
        <Text className="text-2xl font-semibold" style={{ color: text }}>
          {playlist?.name ?? 'Playlist'}
        </Text>
      </View>

      <View className="flex-row gap-2 px-3 pt-2">
        <View className="flex-1 mr-2">
          <SearchBar
            placeholder="Search Song..."
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
              {' '}
              Select
            </Text>
          </Button>
        )}
      </View>

      <View className="flex-1 p-3 pt-2">
        <FlatList
          data={[...filteredSongs].reverse()}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-2">
              <Text
                className="text-[15px] font-semibold text-center"
                style={{ color: muted }}
              >
                No Songs in {playlist?.name ?? 'this Playlist'}
              </Text>
            </View>
          }
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
                  className="text-[15px] font-semibold"
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
                setDialogType('remove');
                openAlert();
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
                setDialogType('delete');
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
      )}
      {dialogType === 'remove' && (
        <AlertDialog
          title="Remove Song"
          description="Are you sure you want to remove the song from the playlist? This action cannot be undone."
          isVisible={isAlertVisible}
          confirmText="Remove"
          onClose={closeAlert}
          onConfirm={handleRemove}
        />
      )}

      {dialogType === 'delete' && (
        <AlertDialog
          title="Delete Song"
          description="Are you sure you want to delete the song? This action cannot be undone."
          isVisible={isAlertVisible}
          confirmText="Delete"
          onClose={closeAlert}
          onConfirm={handleDelete}
        />
      )}
    </View>
  );
}
