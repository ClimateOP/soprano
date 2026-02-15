import { View, Text, BackHandler, Pressable, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEffect } from 'react';
import { usePlayer } from '../context/playerContext';

export default function MiniPlayer() {
  const {
    sound,
    currentSong,
    isPlaying,
    togglePauseResume,
    cyclePlayMode,
    playPrev,
    playNext,
    playerMode,
    setPlayerMode,
    position,
    duration,
    playMode,
  } = usePlayer();

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
        className="absolute bottom-16 left-2 right-2 bg-zinc-900 p-3 rounded-xl flex-row items-center gap-3"
      >
        <Image
          source={{ uri: currentSong.thumbnailUri }}
          style={{ width: 48, height: 48, borderRadius: 8 }}
        />
        <View className="flex-1">
          <Text className="text-white">{currentSong.track}</Text>
          <Text className="text-gray-400 text-xs">{currentSong.artist}</Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable onPress={playPrev}>
            <Text className="text-white">⏮</Text>
          </Pressable>

          <Pressable onPress={togglePauseResume}>
            <Text className="text-white">{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>

          <Pressable onPress={playNext}>
            <Text className="text-white">⏭</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  } else {
    return (
      <View className="absolute inset-0 bg-black p-6 justify-center items-center">
        <Pressable
          onPress={() => setPlayerMode('mini')}
          className="absolute top-12 left-6"
        >
          <Text className="text-white text-lg">↓</Text>
        </Pressable>

        <Image
          source={{ uri: currentSong.thumbnailUri }}
          style={{ width: 260, height: 260, borderRadius: 20 }}
        />

        <Text className="text-white text-xl mt-6">{currentSong.track}</Text>
        <Text className="text-gray-400">{currentSong.artist}</Text>

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
          <Text className="text-xs text-white">{formatTime(position)}</Text>
          <Text className="text-xs text-white">{formatTime(duration)}</Text>
        </View>

        <View className="flex-row gap-6 mt-8 items-center">
          <Pressable onPress={cyclePlayMode}>
            <Text className="text-white text-xs">{playMode}</Text>
          </Pressable>
          <Pressable onPress={playPrev}>
            <Text className="text-white text-xl">⏮</Text>
          </Pressable>

          <Pressable onPress={togglePauseResume}>
            <Text className="text-white text-xl">{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>

          <Pressable onPress={playNext}>
            <Text className="text-white text-xl">⏭</Text>
          </Pressable>

          <Pressable>
            <Text>❤️</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
