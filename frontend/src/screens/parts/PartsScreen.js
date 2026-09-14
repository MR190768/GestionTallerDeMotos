import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function PartsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Módulo de Repuestos e Inventario</Text>
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