import React, { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View, Text, FlatList, Pressable, BackHandler } from 'react-native';

import {
  Playlist,
  getPlaylists,
  createPlaylist,
  deletePlaylists,
} from '@/utils/playlistFunctions';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const { text, muted, card } = useThemeColors();
  const { isVisible, open, close } = useBottomSheet();

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

  const loadPlaylists = async () => {
    setPlaylists(await getPlaylists());
  };

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, []),
  );

  const filteredLists = playlists.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      return;
    }
    await createPlaylist(playlistName.trim());
    close();
    setPlaylistName('');
    loadPlaylists();
  };

  const handleDelete = async () => {
    if (selectedIds.length > 0) {
      await deletePlaylists(selectedIds);
      setSelectMode(false);
      setSelectedIds([]);
      loadPlaylists();
    } else {
      console.log('Select songs first pop up');
    }
  };

  return (
    <>
      <View className="flex-row gap-2 p-4">
        <View className="flex-1 mr-2">
          <SearchBar
            placeholder="Search playlists..."
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

      <FlatList
        data={[
          ...filteredLists.reverse(),
          { id: '__add__', name: '__add__', songIds: [] },
        ]}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        renderItem={({ item }) => {
          if (item.id === '__add__') {
            return (
              <Pressable
                disabled={selectMode}
                onPress={open}
                className="p-4 rounded items-center my-2"
                style={{ backgroundColor: muted }}
              >
                <Text className="text-x font-medium" style={{ color: card }}>
                  + Create Playlist
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              onPress={() =>
                selectMode
                  ? toggleSelect(item.id)
                  : router.push({
                      pathname: '/screens/playlistOpen',
                      params: { id: item.id },
                    })
              }
              className="flex-row items-center gap-3 my-2 p-6 rounded-2xl active:opacity-80 justify-between h-[70px]"
              style={{ backgroundColor: card }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={{ color: text }}
              >
                {item.name}
              </Text>
              {selectMode && (
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                />
              )}
            </Pressable>
          );
        }}
      />

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
              <Text style={{ color: card }}>Cancel</Text>
            </Button>
            <Button
              onPress={handleDelete}
              size="sm"
              style={{ backgroundColor: 'hsl(359, 71%, 58%)' }}
            >
              <Text style={{ color: card }}>Delete</Text>
            </Button>
          </View>
        </>
      )}

      <BottomSheet isVisible={isVisible} onClose={close} snapPoints={[0.23]}>
        <View className="gap-5">
          <Text className="text-xl font-bold" style={{ color: text }}>
            Create Playlist
          </Text>
          <Input
            autoFocus
            placeholder="Enter Playlist Name"
            value={playlistName}
            onChangeText={setPlaylistName}
            className="border rounded-lg mb-2"
            inputStyle={{ fontSize: 15, borderColor: muted }}
          />

          <View className="flex-row justify-around">
            <Button
              onPress={() => {
                close();
                setPlaylistName('');
              }}
              size="sm"
            >
              <Text className="font-medium" style={{ color: card }}>
                Cancel
              </Text>
            </Button>

            <Button
              onPress={handleCreate}
              style={{ backgroundColor: 'hsl(145, 84%, 32%)' }}
              size="sm"
            >
              <Text className="font-medium" style={{ color: card }}>
                Create
              </Text>
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
