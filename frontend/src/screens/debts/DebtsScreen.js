import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import {
  getFinancialSummary,
  getServicesPaymentStatus,
  getTransactions
} from '../../services/debtService';
import { handleApiError, getErrorMessage } from '../../utils/errorHandler';
import {
  SearchIcon,
  ClipboardIcon,
  UserIcon,
  MotorcycleIcon,
  CashIcon,
  CardIcon,
  BankIcon,
  ChevronRightIcon
} from '../../components/common/AppIcons';

const ESPERA_BUSQUEDA = 350;

export default function DebtsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);

  const isAdmin =
    userInfo?.roleId === 1 ||
    userInfo?.role?.toLowerCase() === 'admin' ||
    userInfo?.role?.toLowerCase() === 'administrador';

  const userPermissions = Array.isArray(userInfo?.permissions) ? userInfo.permissions : [];
  const hasFinancePermission = isAdmin || userPermissions.includes('manage_finances');

  // Pestaña activa: 'services' | 'history'
  const [tabActiva, setTabActiva] = useState('services');

  // Resumen / KPIs
  const [summary, setSummary] = useState(null);
  const [cargandoSummary, setCargandoSummary] = useState(true);

  // --- Pestaña 1: Servicios y Cobros ---
  const [servicios, setServicios] = useState([]);
  const [busquedaServicios, setBusquedaServicios] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL'); // 'ALL' | 'PENDING' | 'PARTIAL' | 'PAID'
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [refrescandoServicios, setRefrescandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState('');

  // --- Pestaña 2: Historial Global de Transacciones ---
  const [transacciones, setTransacciones] = useState([]);
  const [busquedaTransacciones, setBusquedaTransacciones] = useState('');
  const [cargandoTransacciones, setCargandoTransacciones] = useState(false);
  const [refrescandoTransacciones, setRefrescandoTransacciones] = useState(false);
  const [errorTransacciones, setErrorTransacciones] = useState('');

  const contadorServicios = useRef(0);
  const contadorTransacciones = useRef(0);

  // Cargar resumen global
  const cargarResumen = useCallback(async () => {
    try {
      setCargandoSummary(true);
      const data = await getFinancialSummary();
      setSummary(data);
    } catch (error) {
      // Error silencioso para no bloquear la pantalla
    } finally {
      setCargandoSummary(false);
    }
  }, []);

  // Cargar lista de servicios
  const cargarServicios = useCallback(async (searchTxt, statusFilter) => {
    const numPet = ++contadorServicios.current;
    try {
      setCargandoServicios(true);
      setErrorServicios('');
      const data = await getServicesPaymentStatus({
        search: searchTxt,
        paymentStatus: statusFilter,
      });
      if (numPet === contadorServicios.current) {
        setServicios(data);
      }
    } catch (error) {
      if (numPet === contadorServicios.current) {
        setErrorServicios(getErrorMessage(error, 'No se pudieron cargar los servicios'));
      }
    } finally {
      if (numPet === contadorServicios.current) {
        setCargandoServicios(false);
      }
    }
  }, []);

  // Cargar transacciones
  const cargarTransacciones = useCallback(async (searchTxt) => {
    const numPet = ++contadorTransacciones.current;
    try {
      setCargandoTransacciones(true);
      setErrorTransacciones('');
      const data = await getTransactions({ search: searchTxt });
      if (numPet === contadorTransacciones.current) {
        setTransacciones(data);
      }
    } catch (error) {
      if (numPet === contadorTransacciones.current) {
        setErrorTransacciones(getErrorMessage(error, 'No se pudo cargar el historial de pagos'));
      }
    } finally {
      if (numPet === contadorTransacciones.current) {
        setCargandoTransacciones(false);
      }
    }
  }, []);

  // Recarga al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      if (hasFinancePermission) {
        cargarResumen();
        if (tabActiva === 'services') {
          cargarServicios(busquedaServicios, filtroEstado);
        } else {
          cargarTransacciones(busquedaTransacciones);
        }
      }
    }, [hasFinancePermission, tabActiva, cargarResumen, cargarServicios, cargarTransacciones])
  );

  // Debounce para búsqueda de servicios
  useEffect(() => {
    if (tabActiva === 'services') {
      const timer = setTimeout(() => {
        cargarServicios(busquedaServicios, filtroEstado);
      }, ESPERA_BUSQUEDA);
      return () => clearTimeout(timer);
    }
  }, [busquedaServicios, filtroEstado, tabActiva, cargarServicios]);

  // Debounce para búsqueda de transacciones
  useEffect(() => {
    if (tabActiva === 'history') {
      const timer = setTimeout(() => {
        cargarTransacciones(busquedaTransacciones);
      }, ESPERA_BUSQUEDA);
      return () => clearTimeout(timer);
    }
  }, [busquedaTransacciones, tabActiva, cargarTransacciones]);

  const manejarRecargaServicios = async () => {
    setRefrescandoServicios(true);
    await Promise.all([cargarResumen(), cargarServicios(busquedaServicios, filtroEstado)]);
    setRefrescandoServicios(false);
  };

  const manejarRecargaTransacciones = async () => {
    setRefrescandoTransacciones(true);
    await Promise.all([cargarResumen(), cargarTransacciones(busquedaTransacciones)]);
    setRefrescandoTransacciones(false);
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
      case 'PAID':
        return styles.badgePaid;
      case 'PARTIAL':
        return styles.badgePartial;
      default:
        return styles.badgePending;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PARTIAL':
        return 'Abono Parcial';
      default:
        return 'Pendiente';
    }
  };

  // Validación de RBAC en Frontend
  if (!hasFinancePermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.deniedTitle}>Acceso Denegado</Text>
        <Text style={styles.deniedText}>
          No cuentas con el permiso 'manage_finances' para acceder al módulo de Finanzas y Pagos.
        </Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Text style={styles.btnBackText}>Volver al Panel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner Superior de KPIs Financieros */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Facturado Total</Text>
          <Text style={styles.kpiValue}>
            ${(summary?.totalBilled || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Recaudado</Text>
          <Text style={[styles.kpiValue, styles.kpiSuccess]}>
            ${(summary?.totalCollected || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Saldo por Cobrar</Text>
          <Text style={[styles.kpiValue, styles.kpiDanger]}>
            ${(summary?.totalPending || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Pestañas de Navegación del Módulo */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tabActiva === 'services' && styles.tabButtonActive]}
          onPress={() => setTabActiva('services')}
        >
          <SearchIcon
            size={16}
            color={tabActiva === 'services' ? colors.textDark : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, tabActiva === 'services' && styles.tabButtonTextActive]}>
            Monitoreo de Servicios
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
            Historial de Pagos
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================================================================== */}
      {/* PESTAÑA 1: MONITOREO DE SERVICIOS                                    */}
      {/* ==================================================================== */}
      {tabActiva === 'services' && (
        <View style={{ flex: 1 }}>
          {/* Buscador reactivo (cliente, moto, placa, ID de servicio) */}
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, moto, placa o # orden..."
            placeholderTextColor={colors.textMuted}
            value={busquedaServicios}
            onChangeText={setBusquedaServicios}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Chips de filtro por estado de cobro */}
          <View style={styles.chipsRow}>
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'PENDING', label: 'Pendientes' },
              { key: 'PARTIAL', label: 'Parciales' },
              { key: 'PAID', label: 'Pagados' },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, filtroEstado === chip.key && styles.chipActive]}
                onPress={() => setFiltroEstado(chip.key)}
              >
                <Text style={[styles.chipText, filtroEstado === chip.key && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Listado de Servicios */}
          <FlatList
            data={servicios}
            keyExtractor={(item) => item.serviceId.toString()}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 30
            }}
            renderItem={({ item }) => {
              const tieneSaldo = item.remainingBalance > 0;

              return (
                <TouchableOpacity
                  style={styles.serviceCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ServicePaymentDetail', {
                      serviceId: item.serviceId,
                    })
                  }
                >
                  {/* Encabezado de la tarjeta */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderNumberText}>Orden #{item.serviceId}</Text>
                    <View style={[styles.badge, getStatusBadgeStyle(item.paymentStatus)]}>
                      <Text style={styles.badgeText}>{getStatusLabel(item.paymentStatus)}</Text>
                    </View>
                  </View>

                  {/* Datos del Cliente y Vehículo */}
                  <View style={styles.iconInfoRow}>
                    <UserIcon size={14} color={colors.textSecondary} />
                    <Text style={styles.clientNameText}>
                      {item.clientName} {item.clientPhone ? `· ${item.clientPhone}` : ''}
                    </Text>
                  </View>

                  <View style={styles.iconInfoRow}>
                    <MotorcycleIcon size={14} color={colors.textSecondary} />
                    <Text style={styles.motorcycleText}>
                      {item.motorcycleBrand} {item.motorcycleModel} ({item.licensePlate || 'Sin placa'})
                    </Text>
                  </View>

                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {item.serviceDescription}
                  </Text>

                  {/* Resumen de Valores Financieros */}
                  <View style={styles.financialNumbersRow}>
                    <View style={styles.numberCol}>
                      <Text style={styles.numberLabel}>Total</Text>
                      <Text style={styles.numberValue}>${item.totalAmount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.numberCol}>
                      <Text style={styles.numberLabel}>Abonado</Text>
                      <Text style={[styles.numberValue, styles.kpiSuccess]}>
                        ${item.totalPaid.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.numberCol}>
                      <Text style={styles.numberLabel}>Saldo</Text>
                      <Text
                        style={[
                          styles.numberValue,
                          tieneSaldo ? styles.kpiDanger : styles.kpiSuccess,
                        ]}
                      >
                        ${item.remainingBalance.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Indicador de acción */}
                  <View style={styles.cardFooterAction}>
                    <Text style={styles.cardActionText}>Gestionar pagos de esta orden</Text>
                    <ChevronRightIcon size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => {
              if (cargandoServicios) {
                return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />;
              }
              if (errorServicios) {
                return (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>{errorServicios}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => cargarServicios(busquedaServicios, filtroEstado)}
                    >
                      <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {busquedaServicios.trim()
                      ? 'No se encontraron servicios que coincidan con la búsqueda.'
                      : 'No hay órdenes de servicio registradas.'}
                  </Text>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refrescandoServicios}
                onRefresh={manejarRecargaServicios}
                tintColor={colors.primary}
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA 2: HISTORIAL GLOBAL DE PAGOS                                 */}
      {/* ==================================================================== */}
      {tabActiva === 'history' && (
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, moto, método o # orden..."
            placeholderTextColor={colors.textMuted}
            value={busquedaTransacciones}
            onChangeText={setBusquedaTransacciones}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FlatList
            data={transacciones}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 30
            }}
            renderItem={({ item }) => (
              <View style={styles.txCard}>
                <View style={styles.txHeader}>
                  <Text style={styles.txAmount}>+${item.amount.toFixed(2)}</Text>
                  <View style={styles.methodTag}>
                    {item.paymentMethod === 'EFECTIVO' ? (
                      <View style={styles.methodTagInner}>
                        <CashIcon size={13} color={colors.textDark} />
                        <Text style={styles.methodTagText}>Efectivo</Text>
                      </View>
                    ) : item.paymentMethod === 'TARJETA' ? (
                      <View style={styles.methodTagInner}>
                        <CardIcon size={13} color={colors.textDark} />
                        <Text style={styles.methodTagText}>Tarjeta</Text>
                      </View>
                    ) : (
                      <View style={styles.methodTagInner}>
                        <BankIcon size={13} color={colors.textDark} />
                        <Text style={styles.methodTagText}>Transf.</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.iconInfoRow}>
                  <UserIcon size={13} color={colors.textSecondary} />
                  <Text style={styles.txClient}>{item.clientName}</Text>
                </View>
                {item.serviceId ? (
                  <Text style={styles.txService}>
                    Orden #{item.serviceId} · {item.motorcycleBrand} {item.motorcycleModel} ({item.licensePlate || 'Sin placa'})
                  </Text>
                ) : null}

                {item.notes ? (
                  <Text style={styles.txNotes}>Nota: {item.notes}</Text>
                ) : null}

                <Text style={styles.txDate}>{formatearFecha(item.date || item.createdAt)}</Text>
              </View>
            )}
            ListEmptyComponent={() => {
              if (cargandoTransacciones) {
                return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />;
              }
              if (errorTransacciones) {
                return (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>{errorTransacciones}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => cargarTransacciones(busquedaTransacciones)}
                    >
                      <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {busquedaTransacciones.trim()
                      ? 'No se encontraron pagos con ese criterio.'
                      : 'Aún no se han registrado cobros o pagos.'}
                  </Text>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refrescandoTransacciones}
                onRefresh={manejarRecargaTransacciones}
                tintColor={colors.primary}
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 8,
  },
  deniedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnBack: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnBackText: {
    color: colors.charcoal,
    fontWeight: 'bold',
    fontSize: 14,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  kpiSuccess: {
    color: colors.success,
  },
  kpiDanger: {
    color: colors.danger,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F1',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.text,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0F2F1',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.charcoal,
    fontWeight: 'bold',
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  badgePaid: {
    borderColor: colors.success,
    backgroundColor: '#E6F9F0',
  },
  badgePartial: {
    borderColor: colors.primary,
    backgroundColor: '#E0F7EF',
  },
  badgePending: {
    borderColor: colors.danger,
    backgroundColor: '#FDE8E8',
  },
  clientNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  motorcycleText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  financialNumbersRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAF9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6EAE8',
    marginBottom: 8,
  },
  numberCol: {
    flex: 1,
    alignItems: 'center',
  },
  numberLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  numberValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardFooterAction: {
    alignItems: 'flex-end',
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  txCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  methodTag: {
    backgroundColor: '#F0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  txClient: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  txService: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  iconInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  methodTagInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});