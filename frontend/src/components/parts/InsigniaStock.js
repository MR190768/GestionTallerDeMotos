import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

// Color de cada estado de stock (el estado lo calcula el backend: OK, LOW o CRITICAL)
const COLOR_POR_ESTADO = {
  OK: colors.success,
  LOW: colors.warning,
  CRITICAL: colors.danger,
};

export default function InsigniaStock({ stock, estado }) {
  const color = COLOR_POR_ESTADO[estado] || colors.textSecondary;

  return (
    // El fondo es el mismo color al 15% de opacidad (sufijo hexadecimal "26"), sin colores fuera de la paleta
    <View style={[styles.insignia, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.texto, { color }]}>{stock} uds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  insignia: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
