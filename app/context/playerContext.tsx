import React, { useState, useRef, createContext, useContext, use } from 'react';
import { Audio } from 'expo-av';

type Song = {
  id: string;
  track: string;
  artist: string;
  fileUri: string;
  thumbnailUri: string;
};

type PlayerMode = 'mini' | 'full';

type PlayerCtx = {
  sound: Audio.Sound | null;
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => Promise<void>;
  togglePauseResume: () => Promise<void>;
  mode: PlayerMode;
  setMode: (m: PlayerMode) => void;
  position: number;
  duration: number;
  seekTo: (millis: number) => void;
};

const PlayerContext = createContext<PlayerCtx | null>(null);

export const PlayerProvider = ({ children }: any) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingRef = useRef(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<PlayerMode>('mini');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playSong = async (song: Song) => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.fileUri },
        { shouldPlay: true },
      );

      soundRef.current = sound;
      setCurrentSong(song);
      setIsPlaying(true);
      setMode('full');

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }

        setPosition(status.positionMillis);
        setDuration(status.durationMillis ?? 0);

        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
    }
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

  const seekTo = async (millis: number) => {
    if (!soundRef.current) {
      return;
    }
    soundRef.current.setPositionAsync(millis);
  };

  return (
    <PlayerContext.Provider
      value={{
        sound: soundRef.current,
        currentSong,
        isPlaying,
        playSong,
        togglePauseResume,
        mode,
        setMode,
        position,
        duration,
        seekTo,
      }}
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
