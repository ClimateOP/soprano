import AsyncStorage from '@react-native-async-storage/async-storage';

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
};

const KEY = 'playlists';

export const getPlaylists = async (): Promise<Playlist[]> => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

export const savePlaylists = async (playlists: Playlist[]) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(playlists));
};

export const createPlaylist = async (name: string) => {
  const lists = await getPlaylists();

  const newList: Playlist = {
    id: Date.now().toString(),
    name,
    songIds: [],
  };

  const updatedLists = [...lists, newList];

  await savePlaylists(updatedLists);
};

export const addSongsToPlaylists = async (
  playlistIds: string[],
  songIds: string[],
) => {
  const lists = await getPlaylists();

  for (const list of lists) {
    if (!playlistIds.includes(list.id)) {
      continue;
    }

    for (const songId of songIds) {
      if (!list.songIds.includes(songId)) {
        list.songIds.push(songId);
      }
    }
  }

  await savePlaylists(lists);
};

export const removeSongsfromPlaylists = async (
  playlistIds: string[],
  songIds: string[],
) => {
  const lists = await getPlaylists();

  for (const list of lists) {
    if (!playlistIds.includes(list.id)) {
      continue;
    }

    list.songIds = list.songIds.filter((id) => !songIds.includes(id));
  }

  await savePlaylists(lists);
};

export const deletePlaylists = async (playlistIds: string[]) => {
  const lists = await getPlaylists();

  const updatedLists = lists.filter((p) => !playlistIds.includes(p.id));

  await savePlaylists(updatedLists);
};
