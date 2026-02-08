import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Image } from 'react-native';

export default function Download() {
  const [query, setQuery] = useState('');
  const [result, setResults] = useState<any[]>([]);

  const search = async () => {
    const res = await fetch(
      `http://192.168.100.8:3000/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data);
  };

  return (
    <View className="flex-1 p-4 gap-3">
      <TextInput
        placeholder="Search song..."
        value={query}
        onChangeText={setQuery}
        className="border p-3 rounded"
      />

      <Button title="Search" onPress={search} />

      <FlatList
        data={result}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row gap-3 my-2">
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: 80, height: 80 }}
            />
            <View className="flex-1">
              <Text numberOfLines={2}>{item.title}</Text>
              <Text>{item.uploader}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
