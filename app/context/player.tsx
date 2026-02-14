import React, {
  useState,
  useRef,
  createContext,
  useContext,
  Children,
} from 'react';
import { Audio } from 'expo-av';

type Song = {
  id: string;
  track: string;
  artist: string;
  fileUri: string;
  thumbnailUri: string;
};

type PlayerCtx = {
  currentSong: Song | null;
  isPlaying: boolean;
  play: (song: Song) => Promise<void>;
  togglePauseResume: () => Promise<void>;
};

const PlayerContext = createContext<PlayerCtx | null>(null);

export const PlayerProvider = ({ children }: any) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async (song: Song) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.fileUri },
      { shouldPlay: true },
    );

    soundRef.current = sound;
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePauseResume = async () => {
    if (!soundRef.current) {
      return;
    } else {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, play, togglePauseResume }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be inside playerProvider');
  }
  return ctx;
};
