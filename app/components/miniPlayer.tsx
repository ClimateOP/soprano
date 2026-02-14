import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from '../context/player';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePauseResume } = usePlayer();

  if (!currentSong) {
    return null;
  }

  return (
    <View className="absolute left-3 right-3 bottom-20 h-16 bg-zinc-900 rounded-2xl px-4 flex-row items-center shadow-lg">
      <Text numberOfLines={1} className="text-white flex-1">
        {currentSong.track}
      </Text>

      <TouchableOpacity onPress={togglePauseResume}>
        <Text className="text-white font-semibold">
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
