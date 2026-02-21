import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type SearchItem = {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  url: string;
  track: string;
  artist: string;
  webpage_url: string;
};

const KEY = 'songs';
const SONG_DIR = FileSystem.documentDirectory + 'songs/';

export const makeDirectory = () => {
  if (Platform.OS !== 'web') {
    FileSystem.makeDirectoryAsync(SONG_DIR, { intermediates: true });
  }
};

export const searchSong = async (query: string) => {
  const res = await fetch(
    `http://192.168.100.7:3000/search?q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  return data;
};

const downloadWithProgress = async (
  url: string,
  uri: string,
  setProgress: (p: number) => void,
) => {
  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    uri,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const prog = totalBytesWritten / totalBytesExpectedToWrite;
      setProgress(prog);
    },
  );

  await downloadResumable.downloadAsync();
};

export const downloadSong = async (
  item: SearchItem,
  track: string,
  artist: string,
  setProgress: (p: number) => void,
) => {
  const fileUri = SONG_DIR + item.id + '.mp3';
  const thumbnailUri = SONG_DIR + item.id + '.jpg';

  await downloadWithProgress(
    `http://192.168.100.7:3000/download?url=${encodeURIComponent(item.webpage_url)}`,
    fileUri,
    setProgress,
  );
  await downloadWithProgress(item.thumbnail, thumbnailUri, setProgress);

  const stored = JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');

  stored.push({
    id: item.id,
    track,
    artist,
    fileUri,
    thumbnailUri,
    playlists: [],
  });

  AsyncStorage.setItem(KEY, JSON.stringify(stored));

  console.log('Downloaded', fileUri);

  //checking
  console.log(FileSystem.documentDirectory);

  const files = await FileSystem.readDirectoryAsync(SONG_DIR);
  console.log('Songs Folder:', files);

  const info = await FileSystem.getInfoAsync(SONG_DIR + files[0]);
  console.log(info);
};
