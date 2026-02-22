import React, {
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { Audio } from 'expo-av';

type Song = {
  id: string;
  track: string;
  artist: string;
  fileUri: string;
  thumbnailUri: string;
};

type PlayerMode = 'mini' | 'full';
type PlayMode = 'Repeat' | 'Repeat1' | 'Shuffle';

type PlayerCtx = {
  sound: Audio.Sound | null;
  currentSong: Song | null;
  isPlaying: boolean;
  loadQueue: (songs: Song[], index: number) => Promise<void>;
  playSong: (song: Song) => Promise<void>;
  togglePauseResume: () => Promise<void>;
  cyclePlayMode: () => void;
  playPrev: () => Promise<void>;
  autoPlay: () => Promise<void>;
  playNext: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  playerMode: PlayerMode;
  setPlayerMode: (m: PlayerMode) => void;
  position: number;
  duration: number;
  playMode: PlayMode;
};

const PlayerContext = createContext<PlayerCtx | null>(null);

export const PlayerProvider = ({ children }: any) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingRef = useRef(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const indexRef = useRef<number>(-1);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>('Repeat1');
  const playModeRef = useRef(playMode);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('mini');

  const loadQueue = async (songs: Song[], index: number) => {
    setQueue(songs);
    setCurrentIndex(index);

    queueRef.current = songs;
    indexRef.current = index;
    await playSong(songs[index]);
  };

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
      setPlayerMode('full');

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }

        setPosition(status.positionMillis);
        setDuration(status.durationMillis ?? 0);

        if (status.didJustFinish) {
          autoPlay();
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

  const cyclePlayMode = () => {
    setPlayMode((m) =>
      m === 'Repeat' ? 'Repeat1' : m === 'Repeat1' ? 'Shuffle' : 'Repeat',
    );
  };

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  const playPrev = async () => {
    const q = queueRef.current;
    if (q.length === 0) {
      return;
    }

    const prev = indexRef.current === 0 ? q.length - 1 : indexRef.current - 1;

    indexRef.current = prev;
    setCurrentIndex(prev);

    await playSong(q[prev]);
  };

  const autoPlay = async () => {
    const q = queueRef.current;
    if (q.length === 0) {
      return;
    }

    const mode = playModeRef.current;
    let nextIndex = indexRef.current;

    if (mode === 'Repeat1') {
    } else if (mode === 'Shuffle') {
      nextIndex = Math.floor(Math.random() * q.length);
    } else {
      nextIndex = (indexRef.current + 1) % q.length;
    }

    indexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    await playSong(q[nextIndex]);
  };

  const playNext = async () => {
    const q = queueRef.current;
    if (q.length === 0) {
      return;
    }

    const next = (indexRef.current + 1) % q.length;

    indexRef.current = next;
    setCurrentIndex(next);

    await playSong(queue[next]);
  };

  const stopPlayback = async () => {
    if (!soundRef.current) return;

    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();

    soundRef.current = null;
    setIsPlaying(false);
    setCurrentSong(null);
    setPosition(0);
    setDuration(0);
    setCurrentIndex(-1);
    queueRef.current = [];
    setQueue([]);
    setPlayerMode('mini');
  };

  return (
    <PlayerContext.Provider
      value={{
        sound: soundRef.current,
        currentSong,
        isPlaying,
        loadQueue,
        playSong,
        togglePauseResume,
        cyclePlayMode,
        playPrev,
        autoPlay,
        playNext,
        stopPlayback,
        playerMode,
        setPlayerMode,
        position,
        duration,
        playMode,
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
