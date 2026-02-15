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
    mode,
    setMode,
    position,
    duration,
  } = usePlayer();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'full') {
        setMode('mini');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [mode]);

  if (!currentSong) {
    return null;
  }

  if (mode == 'mini') {
    return (
      <Pressable
        onPress={() => setMode('full')}
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
        <Pressable onPress={togglePauseResume}>
          <Text className="text-white">{isPlaying ? 'Pause' : 'Resume'}</Text>
        </Pressable>
      </Pressable>
    );
  } else {
    return (
      <View className="absolute inset-0 bg-black p-6 justify-center items-center">
        <Pressable
          onPress={() => setMode('mini')}
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

        <Pressable
          onPress={togglePauseResume}
          className="bg-white px-6 py-3 rounded-xl mt-8"
        >
          <Text>{isPlaying ? 'Pause' : 'Resume'}</Text>
        </Pressable>
      </View>
    );
  }
}
