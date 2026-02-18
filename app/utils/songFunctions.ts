import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { getPlaylists, savePlaylists } from './playlistFunctions';

export type Song = {
  id: string;
  track: string;
  artist: string;
  fileUri: string;
  thumbnailUri: string;
};

const KEY = 'songs';

export const getSongs = async (): Promise<Song[]> => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveSongs = async (songs: Song[]) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(songs));
};

export const deleteSongs = async (deleteSongIds: string[]) => {
  const songs = await getSongs();
  const remainingSongs = songs.filter((s) => !deleteSongIds.includes(s.id));

  for (const s of songs) {
    if (deleteSongIds.includes(s.id)) {
      await FileSystem.deleteAsync(s.fileUri, { idempotent: true });
      await FileSystem.deleteAsync(s.thumbnailUri, { idempotent: true });
    }
  }

  await saveSongs(remainingSongs);

  const playlists = await getPlaylists();

  const updatedLists = playlists.map((p: any) => ({
    ...p,
    songIds: p.songIds.filter((id: string) => !deleteSongIds.includes(id)),
  }));

  await savePlaylists(updatedLists);
};
