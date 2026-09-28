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
import colors from '../../theme/colors';
import {
  obtenerRepuestos,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
  registrarMovimiento
} from '../../services/partService';
import { handleApiError, getErrorMessage } from '../../utils/errorHandler';
import RepuestoItem from '../../components/parts/RepuestoItem';
import ModalMovimiento from '../../components/parts/ModalMovimiento';
import ModalRepuesto from '../../components/parts/ModalRepuesto';

// Milisegundos de espera tras la última tecla antes de consultar al servidor
const ESPERA_BUSQUEDA = 350;

export default function PartsScreen() {
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

  // Evita que una respuesta lenta pise a una búsqueda más reciente
  const contadorPeticiones = useRef(0);

  const repuestoSeleccionado = repuestos.find((repuesto) => repuesto.id === idSeleccionado) || null;

  // --- Cargar catálogo (con o sin texto de búsqueda) ---
  const cargarRepuestos = useCallback(async (texto) => {
    const numeroPeticion = ++contadorPeticiones.current;

    try {
      setCargando(true);
      setErrorCarga('');

      const datos = await obtenerRepuestos(texto);

      if (numeroPeticion === contadorPeticiones.current) {
        setRepuestos(datos);
      }
    } catch (error) {
      if (numeroPeticion === contadorPeticiones.current) {
        setErrorCarga(getErrorMessage(error, 'No se pudo cargar el inventario'));
      }
    } finally {
      if (numeroPeticion === contadorPeticiones.current) {
        setCargando(false);
      }
    }
  }, []);

  // --- Buscar por código o nombre (con espera para no saturar el servidor) ---
  useEffect(() => {
    const espera = busqueda.trim() === '' ? 0 : ESPERA_BUSQUEDA;
    const temporizador = setTimeout(() => cargarRepuestos(busqueda), espera);

    return () => clearTimeout(temporizador);
  }, [busqueda, cargarRepuestos]);

  // --- Deslizar hacia abajo para recargar ---
  const manejarRecarga = async () => {
    setRefrescando(true);
    await cargarRepuestos(busqueda);
    setRefrescando(false);
  };

  // --- Seleccionar / deseleccionar un repuesto de la lista ---
  const manejarSeleccion = (repuesto) => {
    setIdSeleccionado(repuesto.id === idSeleccionado ? null : repuesto.id);
  };

  // --- Abrir el modal de entrada o salida ---
  const abrirMovimiento = (tipo) => {
    if (!repuestoSeleccionado) {
      Alert.alert('Selecciona un repuesto', 'Toca un repuesto de la lista para registrar su entrada o salida.');
      return;
    }

    setTipoMovimiento(tipo);
  };

  // --- Registrar entrada o salida ---
  const confirmarMovimiento = async (cantidad, motivo) => {
    try {
      const { repuesto } = await registrarMovimiento({
        partId: repuestoSeleccionado.id,
        type: tipoMovimiento,
        quantity: cantidad,
        reason: motivo,
      });

      // Se actualiza solo ese repuesto en la lista, sin volver a pedir todo el catálogo
      setRepuestos((actuales) => actuales.map((actual) => (actual.id === repuesto.id ? repuesto : actual)));
      setTipoMovimiento(null);
      return true;
    } catch (error) {
      handleApiError(error, 'Error al Registrar Movimiento', 'No se pudo registrar el movimiento');
      return false;
    }
  };

  // --- Crear o editar un repuesto ---
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

  // --- Eliminar un repuesto ---
  const confirmarEliminacion = (repuesto) => {
    Alert.alert(
      'Eliminar repuesto',
      `¿Seguro que quieres eliminar "${repuesto.name}"? También se borrará su historial de movimientos.`,
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

  // --- Contenido cuando la lista está vacía ---
  const renderizarListaVacia = () => {
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
        {busqueda.trim() ? 'No se encontraron repuestos con esa búsqueda.' : 'Aún no hay repuestos en el inventario.'}
      </Text>
    );
  };

  return (
    <View style={styles.contenedor}>
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
          <Text style={styles.textoBotonNuevo}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.lista}
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
        ListEmptyComponent={renderizarListaVacia}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={manejarRecarga} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
      />

      {/* Sección inferior: registrar movimiento (según el mockup de Inventario) */}
      <View style={styles.seccionMovimiento}>
        <Text style={styles.tituloSeccion}>Registrar movimiento</Text>
        <Text style={styles.ayudaMovimiento}>
          {repuestoSeleccionado
            ? `Seleccionado: ${repuestoSeleccionado.name}`
            : 'Toca un repuesto de la lista para elegirlo'}
        </Text>

        <View style={styles.botonesMovimiento}>
          <TouchableOpacity style={styles.botonMovimiento} onPress={() => abrirMovimiento('ENTRY')}>
            <Text style={styles.textoBotonMovimiento}>↓ Entrada</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonMovimiento} onPress={() => abrirMovimiento('EXIT')}>
            <Text style={styles.textoBotonMovimiento}>↑ Salida</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    padding: 20,
  },
  buscador: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },
  encabezadoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  },
  textoBotonNuevo: {
    color: colors.textDark,
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
  },
  ayudaMovimiento: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  botonesMovimiento: {
    flexDirection: 'row',
    gap: 10,
  },
  botonMovimiento: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  textoBotonMovimiento: {
    color: colors.text,
    fontWeight: 'bold',
  },
});
