import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import colors from '../../theme/colors';
import { obtenerRepuestos } from '../../services/partService';

export default function ModalAsignarRepuesto({ visible, onCerrar, onConfirmar }) {
  const [busqueda, setBusqueda] = useState('');
  const [repuestos, setRepuestos] = useState([]);
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const contadorBusqueda = useRef(0);

  const cargarCatalogo = useCallback(async (filtro) => {
    const idPet = ++contadorBusqueda.current;
    try {
      setCargando(true);
      const datos = await obtenerRepuestos(filtro);
      if (idPet === contadorBusqueda.current) {
        setRepuestos(datos);
      }
    } catch {
      if (idPet === contadorBusqueda.current) {
        setError('No se pudo cargar la lista de repuestos');
      }
    } finally {
      if (idPet === contadorBusqueda.current) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setBusqueda('');
      setRepuestoSeleccionado(null);
      setCantidad('1');
      setError('');
      setGuardando(false);
      cargarCatalogo('');
    }
  }, [visible, cargarCatalogo]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      cargarCatalogo(busqueda);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, visible, cargarCatalogo]);

  const seleccionarRepuesto = (item) => {
    if (item.stock <= 0) return;
    setRepuestoSeleccionado(item);
    setCantidad('1');
    setError('');
  };

  const modificarCantidad = (delta) => {
    if (!repuestoSeleccionado) return;
    const actual = parseInt(cantidad, 10) || 1;
    const nuevo = actual + delta;
    if (nuevo >= 1 && nuevo <= repuestoSeleccionado.stock) {
      setCantidad(String(nuevo));
      setError('');
    }
  };

  const manejarConfirmar = async () => {
    if (!repuestoSeleccionado) {
      setError('Selecciona un repuesto del listado');
      return;
    }

    const cantidadNum = parseInt(cantidad, 10);
    if (!cantidadNum || cantidadNum <= 0) {
      setError('Ingresa una cantidad válida mayor a 0');
      return;
    }

    if (cantidadNum > repuestoSeleccionado.stock) {
      setError(`Stock insuficiente. Disponible: ${repuestoSeleccionado.stock} unidades`);
      return;
    }

    setError('');
    setGuardando(true);

    const exito = await onConfirmar(repuestoSeleccionado.id, cantidadNum);
    if (!exito) {
      setGuardando(false);
    }
  };

  const cantNum = parseInt(cantidad, 10) || 0;
  const precioUnitario = repuestoSeleccionado ? Number(repuestoSeleccionado.price) : 0;
  const subtotal = cantNum * precioUnitario;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>+ Asignar Repuesto a la Orden</Text>
          <Text style={styles.modalSubtitle}>
            Selecciona un repuesto del catálogo y la cantidad requerida.
          </Text>

          {/* Buscador de repuestos */}
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código o nombre..."
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
          />

          {/* Listado de repuestos */}
          <View style={styles.listContainer}>
            {cargando ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
            ) : repuestos.length === 0 ? (
              <Text style={styles.emptyText}>No se encontraron repuestos disponibles.</Text>
            ) : (
              <FlatList
                data={repuestos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const estaSeleccionado = repuestoSeleccionado?.id === item.id;
                  const sinStock = item.stock <= 0;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.itemCard,
                        estaSeleccionado && styles.itemCardSelected,
                        sinStock && styles.itemCardDisabled,
                      ]}
                      onPress={() => seleccionarRepuesto(item)}
                      disabled={sinStock}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemHeader}>
                        <Text style={[styles.itemCode, estaSeleccionado && styles.itemTextSelected]}>
                          {item.code}
                        </Text>
                        <Text
                          style={[
                            styles.itemStockBadge,
                            sinStock ? styles.itemStockZero : styles.itemStockAvailable,
                          ]}
                        >
                          {sinStock ? 'Sin stock' : `${item.stock} disponibles`}
                        </Text>
                      </View>

                      <Text style={[styles.itemName, estaSeleccionado && styles.itemTextSelected]} numberOfLines={1}>
                        {item.name}
                      </Text>

                      <Text style={styles.itemPrice}>
                        ${Number(item.price).toFixed(2)} c/u
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>

          {/* Formulario de cantidad y subtotal */}
          {repuestoSeleccionado && (
            <View style={styles.selectedBox}>
              <View style={styles.selectedRow}>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle} numberOfLines={1}>
                    {repuestoSeleccionado.name}
                  </Text>
                  <Text style={styles.selectedSub}>
                    Precio: ${precioUnitario.toFixed(2)} | Stock: {repuestoSeleccionado.stock}
                  </Text>
                </View>

                {/* Control de cantidad */}
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => modificarCantidad(-1)}
                    disabled={cantNum <= 1}
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="number-pad"
                    value={cantidad}
                    onChangeText={(txt) => {
                      const numOnly = txt.replace(/[^0-9]/g, '');
                      setCantidad(numOnly);
                      setError('');
                    }}
                  />

                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => modificarCantidad(1)}
                    disabled={cantNum >= repuestoSeleccionado.stock}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subtotal proyectado */}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal repuesto:</Text>
                <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCerrar}
              disabled={guardando}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!repuestoSeleccionado || guardando) && styles.buttonDisabled,
              ]}
              onPress={manejarConfirmar}
              disabled={!repuestoSeleccionado || guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <Text style={styles.confirmButtonText}>Agregar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  listContainer: {
    height: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 6,
    marginBottom: 12,
  },
  spinner: {
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 40,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  itemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EDFAF4',
  },
  itemCardDisabled: {
    opacity: 0.45,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  itemTextSelected: {
    color: colors.text,
    fontWeight: 'bold',
  },
  itemStockBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemStockAvailable: {
    backgroundColor: '#E0F7EF',
    color: colors.success,
  },
  itemStockZero: {
    backgroundColor: '#FDE8E8',
    color: colors.danger,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedBox: {
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyInput: {
    width: 44,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    textAlign: 'center',
    marginHorizontal: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.surface,
    padding: 0,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.charcoal,
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
