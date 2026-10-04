import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import {
  obtenerRepuestos,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
  registrarMovimiento,
  obtenerHistorialRepuestosEnServicios
} from '../../services/partService';
import { handleApiError, getErrorMessage } from '../../utils/errorHandler';
import RepuestoItem from '../../components/parts/RepuestoItem';
import ModalMovimiento from '../../components/parts/ModalMovimiento';
import ModalRepuesto from '../../components/parts/ModalRepuesto';
import {
  PackageIcon,
  ClipboardIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '../../components/common/AppIcons';

// Milisegundos de espera tras la última tecla antes de consultar al servidor
const ESPERA_BUSQUEDA = 350;

export default function PartsScreen() {
  const insets = useSafeAreaInsets();
  // Pestaña activa: 'stock' (Catálogo y Stock) | 'history' (Historial en Servicios)
  const [tabActiva, setTabActiva] = useState('stock');

  // --- Estado de la pestaña Stock / Catálogo ---
  const [repuestos, setRepuestos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  // Modal de movimientos: null = cerrado, 'ENTRY' = entrada, 'EXIT' = salida
  const [tipoMovimiento, setTipoMovimiento] = useState(null);

  // Modal de crear/editar repuesto
  const [modalRepuestoVisible, setModalRepuestoVisible] = useState(false);
  const [repuestoEnEdicion, setRepuestoEnEdicion] = useState(null);

  // --- Estado de la pestaña Historial en Servicios ---
  const [historialServicios, setHistorialServicios] = useState([]);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [refrescandoHistorial, setRefrescandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');

  // Evita que respuestas viejas sobrescriban búsquedas recientes
  const contadorPeticionesStock = useRef(0);
  const contadorPeticionesHistorial = useRef(0);

  const repuestoSeleccionado = repuestos.find((r) => r.id === idSeleccionado) || null;

  // --- Cargar catálogo de repuestos ---
  const cargarRepuestos = useCallback(async (texto) => {
    const numPet = ++contadorPeticionesStock.current;

    try {
      setCargando(true);
      setErrorCarga('');

      const datos = await obtenerRepuestos(texto);

      if (numPet === contadorPeticionesStock.current) {
        setRepuestos(datos);
      }
    } catch (error) {
      if (numPet === contadorPeticionesStock.current) {
        setErrorCarga(getErrorMessage(error, 'No se pudo cargar el inventario'));
      }
    } finally {
      if (numPet === contadorPeticionesStock.current) {
        setCargando(false);
      }
    }
  }, []);

  // --- Cargar historial de uso en servicios ---
  const cargarHistorialServicios = useCallback(async (texto) => {
    const numPet = ++contadorPeticionesHistorial.current;

    try {
      setCargandoHistorial(true);
      setErrorHistorial('');

      const datos = await obtenerHistorialRepuestosEnServicios(texto);

      if (numPet === contadorPeticionesHistorial.current) {
        setHistorialServicios(datos);
      }
    } catch (error) {
      if (numPet === contadorPeticionesHistorial.current) {
        setErrorHistorial(getErrorMessage(error, 'No se pudo cargar el historial de servicios'));
      }
    } finally {
      if (numPet === contadorPeticionesHistorial.current) {
        setCargandoHistorial(false);
      }
    }
  }, []);

  // Debounce para búsqueda en catálogo
  useEffect(() => {
    if (tabActiva === 'stock') {
      const espera = busqueda.trim() === '' ? 0 : ESPERA_BUSQUEDA;
      const temporizador = setTimeout(() => cargarRepuestos(busqueda), espera);
      return () => clearTimeout(temporizador);
    }
  }, [busqueda, tabActiva, cargarRepuestos]);

  // Debounce para búsqueda en historial
  useEffect(() => {
    if (tabActiva === 'history') {
      const espera = busquedaHistorial.trim() === '' ? 0 : ESPERA_BUSQUEDA;
      const temporizador = setTimeout(() => cargarHistorialServicios(busquedaHistorial), espera);
      return () => clearTimeout(temporizador);
    }
  }, [busquedaHistorial, tabActiva, cargarHistorialServicios]);

  // Carga inicial al cambiar de pestaña
  useEffect(() => {
    if (tabActiva === 'history' && historialServicios.length === 0 && !cargandoHistorial) {
      cargarHistorialServicios(busquedaHistorial);
    }
  }, [tabActiva]);

  // Recarga catálogo
  const manejarRecargaStock = async () => {
    setRefrescando(true);
    await cargarRepuestos(busqueda);
    setRefrescando(false);
  };

  // Recarga historial
  const manejarRecargaHistorial = async () => {
    setRefrescandoHistorial(true);
    await cargarHistorialServicios(busquedaHistorial);
    setRefrescandoHistorial(false);
  };

  const manejarSeleccion = (repuesto) => {
    setIdSeleccionado(repuesto.id === idSeleccionado ? null : repuesto.id);
  };

  const abrirMovimiento = (tipo) => {
    if (!repuestoSeleccionado) {
      Alert.alert('Selecciona un repuesto', 'Toca un repuesto de la lista para registrar su entrada o salida.');
      return;
    }
    setTipoMovimiento(tipo);
  };

  const confirmarMovimiento = async (cantidad, motivo) => {
    try {
      const { repuesto } = await registrarMovimiento({
        partId: repuestoSeleccionado.id,
        type: tipoMovimiento,
        quantity: cantidad,
        reason: motivo,
      });

      setRepuestos((actuales) => actuales.map((a) => (a.id === repuesto.id ? repuesto : a)));
      setTipoMovimiento(null);
      return true;
    } catch (error) {
      handleApiError(error, 'Error al Registrar Movimiento', 'No se pudo registrar el movimiento');
      return false;
    }
  };

  const abrirNuevoRepuesto = () => {
    setRepuestoEnEdicion(null);
    setModalRepuestoVisible(true);
  };

  const abrirEdicion = (repuesto) => {
    setRepuestoEnEdicion(repuesto);
    setModalRepuestoVisible(true);
  };

  const guardarRepuesto = async (datos) => {
    try {
      if (repuestoEnEdicion) {
        await actualizarRepuesto(repuestoEnEdicion.id, datos);
      } else {
        await crearRepuesto(datos);
      }

      setModalRepuestoVisible(false);
      await cargarRepuestos(busqueda);
      return true;
    } catch (error) {
      handleApiError(error, 'Error al Guardar', 'No se pudo guardar el repuesto');
      return false;
    }
  };

  const confirmarEliminacion = (repuesto) => {
    Alert.alert(
      'Eliminar repuesto',
      `¿Seguro que quieres eliminar "${repuesto.name}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarRepuesto(repuesto.id);
              setIdSeleccionado(null);
              await cargarRepuestos(busqueda);
            } catch (error) {
              handleApiError(error, 'Error al Eliminar', 'No se pudo eliminar el repuesto');
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleString('es-SV', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return String(fecha);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return styles.statusInProgress;
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'En proceso';
      case 'COMPLETED':
        return 'Finalizado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  // Totales estadísticos del historial cargado
  const totalPiezasHistorial = historialServicios.reduce(
    (acc, h) => acc + (parseInt(h.quantity, 10) || 0),
    0
  );
  const totalMontoHistorial = historialServicios.reduce(
    (acc, h) => acc + (parseFloat(h.subtotal) || 0),
    0
  );

  return (
    <View style={styles.contenedor}>
      {/* Selector de pestañas superiores */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tabActiva === 'stock' && styles.tabButtonActive]}
          onPress={() => setTabActiva('stock')}
        >
          <PackageIcon
            size={16}
            color={tabActiva === 'stock' ? colors.textDark : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, tabActiva === 'stock' && styles.tabButtonTextActive]}>
            Catálogo y Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tabActiva === 'history' && styles.tabButtonActive]}
          onPress={() => setTabActiva('history')}
        >
          <ClipboardIcon
            size={16}
            color={tabActiva === 'history' ? colors.textDark : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, tabActiva === 'history' && styles.tabButtonTextActive]}>
            Historial en Servicios
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================================================================== */}
      {/* VISTA 1: CATÁLOGO Y STOCK DE INVENTARIO                              */}
      {/* ==================================================================== */}
      {tabActiva === 'stock' && (
        <>
          <TextInput
            style={styles.buscador}
            placeholder="Buscar por código o nombre"
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.encabezadoLista}>
            <Text style={styles.tituloSeccion}>Stock actual</Text>

            <TouchableOpacity style={styles.botonNuevo} onPress={abrirNuevoRepuesto}>
              <PlusIcon size={14} color={colors.textDark} />
              <Text style={styles.textoBotonNuevo}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.lista}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 30
            }}
            data={repuestos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RepuestoItem
                repuesto={item}
                seleccionado={item.id === idSeleccionado}
                onPress={() => manejarSeleccion(item)}
                onEditar={() => abrirEdicion(item)}
                onEliminar={() => confirmarEliminacion(item)}
              />
            )}
            ListEmptyComponent={() => {
              if (cargando) {
                return <ActivityIndicator size="large" color={colors.primary} style={styles.cargando} />;
              }
              if (errorCarga) {
                return (
                  <View style={styles.estadoVacio}>
                    <Text style={styles.textoError}>{errorCarga}</Text>
                    <TouchableOpacity style={styles.botonReintentar} onPress={() => cargarRepuestos(busqueda)}>
                      <Text style={styles.textoBotonReintentar}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <Text style={styles.textoVacio}>
                  {busqueda.trim()
                    ? 'No se encontraron repuestos con esa búsqueda.'
                    : 'Aún no hay repuestos en el inventario.'}
                </Text>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={manejarRecargaStock}
                tintColor={colors.primary}
              />
            }
            keyboardShouldPersistTaps="handled"
          />

          {/* Sección inferior: registrar entrada o salida manual */}
          <View style={[
            styles.seccionMovimiento,
            { paddingBottom: Math.max(insets.bottom, 32) + 20 }
          ]}>
            <Text style={styles.tituloSeccion}>Ajuste manual de stock</Text>
            <Text style={styles.ayudaMovimiento}>
              {repuestoSeleccionado
                ? `Seleccionado: ${repuestoSeleccionado.name}`
                : 'Toca un repuesto de la lista para elegirlo'}
            </Text>

            <View style={styles.botonesMovimiento}>
              <TouchableOpacity
                style={[styles.botonMovimiento, styles.botonEntrada]}
                onPress={() => abrirMovimiento('ENTRY')}
                activeOpacity={0.7}
              >
                <ArrowDownIcon size={16} color={colors.primary} />
                <Text style={styles.textoBotonMovimiento}>Entrada</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonMovimiento, styles.botonSalida]}
                onPress={() => abrirMovimiento('EXIT')}
                activeOpacity={0.7}
              >
                <ArrowUpIcon size={16} color={colors.danger} />
                <Text style={styles.textoBotonMovimiento}>Salida</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: HISTORIAL DE REPUESTOS USADOS EN SERVICIOS                  */}
      {/* ==================================================================== */}
      {tabActiva === 'history' && (
        <View style={[styles.historyContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TextInput
            style={styles.buscador}
            placeholder="Buscar por repuesto, placa o cliente..."
            placeholderTextColor={colors.textMuted}
            value={busquedaHistorial}
            onChangeText={setBusquedaHistorial}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Barra de resumen estadístico */}
          <View style={styles.statsBanner}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{historialServicios.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalPiezasHistorial}</Text>
              <Text style={styles.statLabel}>Piezas usadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, styles.statNumberMoney]}>
                ${totalMontoHistorial.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total repuestos</Text>
            </View>
          </View>

          <FlatList
            style={styles.lista}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 30
            }}
            data={historialServicios}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                {/* Cabecera de la tarjeta: Repuesto y Orden de Servicio */}
                <View style={styles.historyCardHeader}>
                  <View style={styles.partCodeBadge}>
                    <Text style={styles.partCodeText}>{item.partCode}</Text>
                  </View>

                  <View style={[styles.statusBadge, getStatusBadgeStyle(item.serviceStatus)]}>
                    <Text style={styles.statusBadgeText}>
                      Orden #{item.serviceId} · {getStatusLabel(item.serviceStatus)}
                    </Text>
                  </View>
                </View>

                {/* Nombre del repuesto y desglose económico */}
                <View style={styles.historyRowMain}>
                  <Text style={styles.historyPartName}>{item.partName}</Text>
                  <Text style={styles.historySubtotal}>${Number(item.subtotal).toFixed(2)}</Text>
                </View>

                <Text style={styles.historyQuantityText}>
                  Cantidad: {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} × ${Number(item.unitPrice).toFixed(2)} c/u
                </Text>

                <View style={styles.cardDivider} />

                {/* Información del vehículo y cliente */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Vehículo:</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {item.motorcycleBrand} {item.motorcycleModel} ({item.licensePlate || 'Sin placa'})
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Cliente:</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {item.clientName}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Fecha:</Text>
                  <Text style={styles.metaDate}>
                    {formatearFecha(item.dateUsed)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => {
              if (cargandoHistorial) {
                return <ActivityIndicator size="large" color={colors.primary} style={styles.cargando} />;
              }
              if (errorHistorial) {
                return (
                  <View style={styles.estadoVacio}>
                    <Text style={styles.textoError}>{errorHistorial}</Text>
                    <TouchableOpacity
                      style={styles.botonReintentar}
                      onPress={() => cargarHistorialServicios(busquedaHistorial)}
                    >
                      <Text style={styles.textoBotonReintentar}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <Text style={styles.textoVacio}>
                  {busquedaHistorial.trim()
                    ? 'No se encontraron registros de repuestos en servicios con esa búsqueda.'
                    : 'Aún no se han utilizado repuestos en órdenes de servicio.'}
                </Text>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refrescandoHistorial}
                onRefresh={manejarRecargaHistorial}
                tintColor={colors.primary}
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Modales de Gestión de Repuestos */}
      <ModalMovimiento
        visible={tipoMovimiento !== null}
        tipo={tipoMovimiento}
        repuesto={repuestoSeleccionado}
        onCerrar={() => setTipoMovimiento(null)}
        onConfirmar={confirmarMovimiento}
      />

      <ModalRepuesto
        visible={modalRepuestoVisible}
        repuesto={repuestoEnEdicion}
        onCerrar={() => setModalRepuestoVisible(false)}
        onGuardar={guardarRepuesto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F1',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.text,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
  },
  buscador: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statNumberMoney: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  encabezadoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  botonNuevo: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoBotonNuevo: {
    color: colors.charcoal,
    fontWeight: 'bold',
    fontSize: 13,
  },
  lista: {
    flex: 1,
  },
  cargando: {
    marginTop: 30,
  },
  textoVacio: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 30,
    fontSize: 14,
  },
  estadoVacio: {
    alignItems: 'center',
    marginTop: 30,
  },
  textoError: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  botonReintentar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textoBotonReintentar: {
    color: colors.text,
    fontWeight: 'bold',
  },
  seccionMovimiento: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginTop: 8,
    backgroundColor: colors.background,
  },
  ayudaMovimiento: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  botonesMovimiento: {
    flexDirection: 'row',
    gap: 12,
  },
  botonMovimiento: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  botonEntrada: {
    borderColor: colors.primary,
    backgroundColor: '#F3FAF6',
  },
  botonSalida: {
    borderColor: colors.danger,
    backgroundColor: '#FDF4F4',
  },
  textoBotonMovimiento: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Tarjetas de historial en servicios
  historyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  partCodeBadge: {
    backgroundColor: '#EEF2F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partCodeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusPending: {
    borderColor: colors.border,
    backgroundColor: '#F5F5F5',
  },
  statusInProgress: {
    borderColor: colors.primary,
    backgroundColor: '#E0F7EF',
  },
  statusCompleted: {
    borderColor: colors.success,
    backgroundColor: '#E6F9F0',
  },
  statusCancelled: {
    borderColor: colors.danger,
    backgroundColor: '#FDE8E8',
  },
  historyRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPartName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  historySubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  historyQuantityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: colors.text,
    maxWidth: '70%',
    textAlign: 'right',
  },
  metaDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
