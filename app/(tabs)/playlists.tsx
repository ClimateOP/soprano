import React, { useState, useCallback, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  BackHandler,
} from 'react-native';

import {
  Playlist,
  getPlaylists,
  createPlaylist,
  deletePlaylists,
} from '@/utils/playlistFunctions';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const { text, muted, card } = useThemeColors();

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
    setSheetOpen(false);
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
            <Text style={{ color: card }}>Select</Text>
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
                onPress={() => setSheetOpen(true)}
                className="p-4 rounded items-center my-2"
                style={{ backgroundColor: muted }}
              >
                <Text className="text-x" style={{ color: card }}>
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
              className="flex-row items-center gap-3 my-2 p-6 rounded-2xl active:opacity-80 justify-between"
              style={{ backgroundColor: card }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={{ color: text }}
              >
                {item.name}
              </Text>
              {selectMode && (
                <Text>{selectedIds.includes(item.id) ? '☑️' : '⬜'}</Text>
              )}
            </Pressable>
          );
        }}
      />

      {selectMode && (
        <>
          <View className="absolute inset-0" pointerEvents="none" />
          <View className="absolute bottom-0 left-0 right-0 bg-white p-4 flex-row justify-around border-t">
            <Pressable
              onPress={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleDelete}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable
          onPress={() => setSheetOpen(false)}
          className="flex-1 justify-end bg-black/40"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white p-4 gap-3 rounded-t-2xl"
          >
            <Text>Create Playlist</Text>
            <TextInput
              placeholder="Playlist Name"
              value={playlistName}
              onChangeText={setPlaylistName}
              className="border p-2 rounded"
            />
            <Pressable
              onPress={() => {
                setSheetOpen(false);
                setPlaylistName('');
              }}
              className="bg-gray-300 p-3 rounded"
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              className="bg-blue-500 p-3 rounded"
            >
              <Text className="text-white text-center">Create</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
