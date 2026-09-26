import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function AddClientScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Agregar Cliente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background 
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500'
  }
});