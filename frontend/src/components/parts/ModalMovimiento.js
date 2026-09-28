import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import colors from '../../theme/colors';

/**
 * Modal para registrar una entrada o salida de stock.
 *
 * Props:
 *  - visible:     muestra u oculta el modal
 *  - tipo:        'ENTRY' (entrada) | 'EXIT' (salida)
 *  - repuesto:    repuesto al que se le aplica el movimiento
 *  - onCerrar:    se llama al cancelar
 *  - onConfirmar: async (cantidad, motivo) => boolean. Devuelve true si se registró bien
 */
export default function ModalMovimiento({ visible, tipo, repuesto, onCerrar, onConfirmar }) {
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esEntrada = tipo === 'ENTRY';

  // Cada vez que se abre el modal, el formulario empieza limpio
  useEffect(() => {
    if (visible) {
      setCantidad('');
      setMotivo('');
      setError('');
      setGuardando(false);
    }
  }, [visible]);

  if (!repuesto) {
    return null;
  }

  const cantidadNumerica = Number(cantidad);
  const stockResultante = esEntrada
    ? repuesto.stock + cantidadNumerica
    : repuesto.stock - cantidadNumerica;

  const manejarConfirmacion = async () => {
    if (!cantidad || !Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setError('Ingresa una cantidad entera mayor a 0');
      return;
    }

    if (!esEntrada && cantidadNumerica > repuesto.stock) {
      setError(`Stock insuficiente: solo hay ${repuesto.stock} unidades disponibles`);
      return;
    }

    setError('');
    setGuardando(true);

    const exito = await onConfirmar(cantidadNumerica, motivo.trim());

    // Si falló, se rehabilita el botón; si salió bien, el padre cierra el modal
    if (!exito) {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={styles.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>
            {esEntrada ? '↓ Registrar entrada' : '↑ Registrar salida'}
          </Text>

          <Text style={styles.nombreRepuesto}>{repuesto.name}</Text>
          <Text style={styles.detalleRepuesto}>
            Cod. {repuesto.code} · Stock actual: {repuesto.stock} uds
          </Text>

          <Text style={styles.etiqueta}>Cantidad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 5"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={cantidad}
            onChangeText={(texto) => {
              setCantidad(texto.replace(/[^0-9]/g, ''));
              setError('');
            }}
            maxLength={7}
            autoFocus
          />

          <Text style={styles.etiqueta}>Motivo (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder={esEntrada ? 'Ej. Compra a proveedor' : 'Ej. Usado en servicio'}
            placeholderTextColor={colors.textMuted}
            value={motivo}
            onChangeText={setMotivo}
            maxLength={255}
          />

          {cantidadNumerica > 0 && !error && (
            <Text style={styles.resultado}>
              Stock resultante: {stockResultante >= 0 ? stockResultante : 0} uds
            </Text>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.botones}>
            <TouchableOpacity style={styles.botonCancelar} onPress={onCerrar} disabled={guardando}>
              <Text style={styles.textoBotonCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonConfirmar, guardando && styles.botonDeshabilitado]}
              onPress={manejarConfirmacion}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color={colors.textDark} />
              ) : (
                <Text style={styles.textoBotonConfirmar}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: `${colors.charcoal}99`,
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  nombreRepuesto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  detalleRepuesto: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
  },
  resultado: {
    marginTop: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  error: {
    marginTop: 12,
    color: colors.error,
    fontWeight: 'bold',
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    color: colors.text,
    fontWeight: 'bold',
  },
  botonConfirmar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textoBotonConfirmar: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
