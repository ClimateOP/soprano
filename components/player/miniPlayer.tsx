import { View, Text, BackHandler, Pressable, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEffect } from 'react';
import { usePlayer } from '../../context/playerContext';
import { router } from 'expo-router';
import { Icon } from '../ui/icon';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  SkipBack,
  Pause,
  Play,
  SkipForward,
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  ArrowDown,
  X,
} from 'lucide-react-native';
import { Button } from '../ui/button';

export default function MiniPlayer() {
  const {
    sound,
    currentSong,
    isPlaying,
    togglePauseResume,
    cyclePlayMode,
    playPrev,
    playNext,
    stopPlayback,
    playerMode,
    setPlayerMode,
    position,
    duration,
    playMode,
  } = usePlayer();
  const { text, muted, card, background, border } = useThemeColors();
  const PlayModeIcon = {
    Repeat: Repeat,
    Repeat1: Repeat1,
    Shuffle: Shuffle,
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (playerMode === 'full') {
        setPlayerMode('mini');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [playerMode]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return null;
  }

  if (playerMode == 'mini') {
    return (
      <Pressable
        onPress={() => setPlayerMode('full')}
        className="absolute bottom-28 left-2 right-2 p-3 rounded-xl flex-row items-center gap-3"
        style={{ backgroundColor: card }}
      >
        <Image
          source={{ uri: currentSong.thumbnailUri }}
          className="w-[55px] h-[55px] rounded-xl"
        />
        <View className="flex-1">
          <Text className="text-sm" style={{ color: text }}>
            {currentSong.track}
          </Text>
          <Text className="text-xs" style={{ color: muted }}>
            {currentSong.artist}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable onPress={playPrev}>
            <Icon name={SkipBack} />
          </Pressable>

          <Pressable onPress={togglePauseResume}>
            <Icon name={isPlaying ? Pause : Play} />
          </Pressable>

          <Pressable onPress={playNext}>
            <Icon name={SkipForward} />
          </Pressable>
        </View>
      </Pressable>
    );
  } else {
    return (
      <View
        className="absolute inset-0 p-6 justify-center items-center"
        style={{ backgroundColor: background }}
      >
        <View className="absolute top-14 left-6 right-6 flex-row justify-between">
          <Button
            onPress={() => setPlayerMode('mini')}
            variant="outline"
            size="sm"
          >
            <Icon name={ArrowDown} />
          </Button>

          <Button onPress={stopPlayback} variant="outline" size="sm">
            <Icon name={X} />
          </Button>
        </View>

        <Image
          source={{ uri: currentSong.thumbnailUri }}
          className="w-[300px] h-[300px] rounded-3xl top-2"
          style={{ borderWidth: 1, borderColor: border }}
        />

        <Text
          className="text-xl mt-6 text-center pt-4 pb-2"
          style={{ color: text }}
        >
          {currentSong.track}
        </Text>
        <Text className="pb-3" style={{ color: muted }}>
          {currentSong.artist}
        </Text>

        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={async (value) => {
            if (sound) {
              await sound.setPositionAsync(value);
            }
          }}
        />

        <View className="flex-row justify-between items-center w-full px-1">
          <Text className="text-xs" style={{ color: text }}>
            {formatTime(position)}
          </Text>
          <Text className="text-xs" style={{ color: text }}>
            {formatTime(duration)}
          </Text>
        </View>

        <View
          className="flex-row gap-8 mt-12 p-6 items-center rounded-3xl"
          style={{ borderWidth: 1, borderColor: border }}
        >
          <Button onPress={cyclePlayMode} variant="link">
            <Icon name={PlayModeIcon[playMode]} />
          </Button>
          <Button onPress={playPrev} variant="link">
            <Icon name={SkipBack} />
          </Button>

          <Button onPress={togglePauseResume} variant="link">
            <Icon name={isPlaying ? Pause : Play} />
          </Button>

          <Button onPress={playNext} variant="link">
            <Icon name={SkipForward} />
          </Button>

          <Button
            onPress={() => {
              router.push({
                pathname: '/screens/playlistSelector',
                params: { songIds: JSON.stringify([currentSong.id]) },
              });
              setPlayerMode('mini');
            }}
            variant="link"
          >
            <Icon name={Heart} />
          </Button>
        </View>
      </View>
    );
  }
}
