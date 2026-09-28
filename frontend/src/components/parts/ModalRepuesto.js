import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import colors from '../../theme/colors';

/**
 * Modal para crear o editar un repuesto.
 *
 * Props:
 *  - visible:    muestra u oculta el modal
 *  - repuesto:   repuesto a editar; si es null, el modal funciona como "Nuevo repuesto"
 *  - onCerrar:   se llama al cancelar
 *  - onGuardar:  async (datos) => boolean. Devuelve true si se guardó bien
 */
export default function ModalRepuesto({ visible, repuesto, onCerrar, onGuardar }) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const estaEditando = !!repuesto;

  // Al abrir el modal se cargan los datos del repuesto (o se dejan vacíos si es nuevo)
  useEffect(() => {
    if (visible) {
      setCodigo(repuesto?.code || '');
      setNombre(repuesto?.name || '');
      setDescripcion(repuesto?.description || '');
      setPrecio(repuesto ? String(repuesto.price) : '');
      setStock(repuesto ? String(repuesto.stock) : '0');
      setStockMinimo(repuesto ? String(repuesto.minStock) : '10');
      setError('');
      setGuardando(false);
    }
  }, [visible, repuesto]);

  const soloDigitos = (texto) => texto.replace(/[^0-9]/g, '');

  const manejarGuardado = async () => {
    const precioNumerico = Number(precio.replace(',', '.'));

    if (!codigo.trim()) {
      setError('El código es obligatorio');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!precio.trim() || Number.isNaN(precioNumerico) || precioNumerico <= 0) {
      setError('El precio debe ser un número mayor a 0');
      return;
    }

    if (stock === '' || stockMinimo === '') {
      setError('El stock y el stock mínimo son obligatorios');
      return;
    }

    setError('');
    setGuardando(true);

    const exito = await onGuardar({
      code: codigo.trim(),
      name: nombre.trim(),
      description: descripcion.trim(),
      price: precioNumerico,
      stock: Number(stock),
      minStock: Number(stockMinimo),
    });

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
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>
              {estaEditando ? 'Editar repuesto' : 'Nuevo repuesto'}
            </Text>

            <Text style={styles.etiqueta}>Código</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. AC-102"
              placeholderTextColor={colors.textMuted}
              value={codigo}
              onChangeText={setCodigo}
              autoCapitalize="characters"
              maxLength={50}
            />

            <Text style={styles.etiqueta}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Aceite 20W50"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
              maxLength={100}
            />

            <Text style={styles.etiqueta}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Detalles del repuesto"
              placeholderTextColor={colors.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />

            <Text style={styles.etiqueta}>Precio ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 8.50"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={precio}
              onChangeText={setPrecio}
            />

            <View style={styles.filaDoble}>
              <View style={styles.columna}>
                <Text style={styles.etiqueta}>Stock</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={stock}
                  onChangeText={(texto) => setStock(soloDigitos(texto))}
                  maxLength={7}
                />
              </View>

              <View style={styles.columna}>
                <Text style={styles.etiqueta}>Stock mínimo</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={stockMinimo}
                  onChangeText={(texto) => setStockMinimo(soloDigitos(texto))}
                  maxLength={7}
                />
              </View>
            </View>

            <Text style={styles.ayuda}>
              El stock mínimo es el umbral a partir del cual se muestra la alerta de bajo stock.
            </Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.botones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={onCerrar} disabled={guardando}>
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
                onPress={manejarGuardado}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color={colors.textDark} />
                ) : (
                  <Text style={styles.textoBotonGuardar}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
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
  inputMultilinea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  filaDoble: {
    flexDirection: 'row',
    gap: 10,
  },
  columna: {
    flex: 1,
  },
  ayuda: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
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
  botonGuardar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textoBotonGuardar: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
