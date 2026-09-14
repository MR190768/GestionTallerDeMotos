import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PartsScreen() {
  return (
    <View style={styles.container}>
      <Text>Parts Module Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});