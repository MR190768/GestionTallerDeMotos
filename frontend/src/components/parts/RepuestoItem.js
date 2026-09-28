import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import InsigniaStock from './InsigniaStock';

const formatearPrecio = (precio) => `$${Number(precio).toFixed(2)}`;

export default function RepuestoItem({ repuesto, seleccionado, onPress, onEditar, onEliminar }) {
  return (
    <View style={[styles.contenedor, seleccionado && styles.contenedorSeleccionado]}>
      <TouchableOpacity style={styles.fila} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.datos}>
          <Text style={styles.nombre}>{repuesto.name}</Text>
          <Text style={styles.detalle}>
            Cod. {repuesto.code} · {formatearPrecio(repuesto.price)}
          </Text>
        </View>

        <InsigniaStock stock={repuesto.stock} estado={repuesto.stockStatus} />
      </TouchableOpacity>

      {/* Acciones de edición: solo se muestran en el repuesto seleccionado */}
      {seleccionado && (
        <View style={styles.acciones}>
          <TouchableOpacity style={styles.botonEditar} onPress={onEditar}>
            <Text style={styles.textoBotonEditar}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonEliminar} onPress={onEliminar}>
            <Text style={styles.textoBotonEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  contenedorSeleccionado: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}14`,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datos: {
    flex: 1,
    paddingRight: 12,
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  detalle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonEditar: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: colors.danger,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonEliminar: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
});
