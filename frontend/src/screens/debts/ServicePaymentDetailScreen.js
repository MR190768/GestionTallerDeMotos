import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import {
  getServiceFinanceDetail,
  registerPayment
} from '../../services/debtService';
import { handleApiError } from '../../utils/errorHandler';
import {
  CashIcon,
  CardIcon,
  BankIcon,
  CheckCircleIcon
} from '../../components/common/AppIcons';

export default function ServicePaymentDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { serviceId } = route.params || {};
  const { userInfo } = useContext(AuthContext);

  const isAdmin =
    userInfo?.roleId === 1 ||
    userInfo?.role?.toLowerCase() === 'admin' ||
    userInfo?.role?.toLowerCase() === 'administrador';

  const userPermissions = Array.isArray(userInfo?.permissions) ? userInfo.permissions : [];
  const hasFinancePermission = isAdmin || userPermissions.includes('manage_finances');

  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Formulario de pago
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [notas, setNotas] = useState('');
  const [guardandoPago, setGuardandoPago] = useState(false);

  const cargarDetalle = useCallback(async () => {
    if (!serviceId) return;
    try {
      setCargando(true);
      const data = await getServiceFinanceDetail(serviceId);
      setDetalle(data);
    } catch (error) {
      handleApiError(error, 'Error Financiero', 'No se pudo cargar la información de la orden');
    } finally {
      setCargando(false);
    }
  }, [serviceId]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  const manejarRecarga = async () => {
    setRefrescando(true);
    await cargarDetalle();
    setRefrescando(false);
  };

  const aplicarSaldoRestante = () => {
    if (detalle && detalle.remainingBalance > 0) {
      setMonto(detalle.remainingBalance.toFixed(2));
    }
  };

  const manejarRegistroPago = async () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto numérico mayor a 0');
      return;
    }

    if (montoNum > (detalle.remainingBalance + 0.01)) {
      Alert.alert(
        'Monto excede saldo',
        `El monto ($${montoNum.toFixed(2)}) supera el saldo pendiente ($${detalle.remainingBalance.toFixed(2)}).`
      );
      return;
    }

    try {
      setGuardandoPago(true);
      const updated = await registerPayment({
        serviceId: detalle.serviceId,
        amount: montoNum,
        paymentMethod: metodoPago,
        notes: notas.trim() || undefined,
      });

      setDetalle(updated);
      setMonto('');
      setNotas('');
      Alert.alert('Pago Registrado', 'El cobro ha sido registrado exitosamente.');
    } catch (error) {
      handleApiError(error, 'Error al Registrar Pago', 'No se pudo procesar el pago');
    } finally {
      setGuardandoPago(false);
    }
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
        return 'Pendiente de Pago';
    }
  };

  // Validación de RBAC
  if (!hasFinancePermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.deniedTitle}>Acceso Denegado</Text>
        <Text style={styles.deniedText}>
          No tienes el permiso 'manage_finances' para acceder a este módulo financiero.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando información financiera...</Text>
      </View>
    );
  }

  if (!detalle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.deniedTitle}>Orden no encontrada</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Regresar a Finanzas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const montoNum = parseFloat(monto) || 0;
  const nuevoSaldoProyectado = Math.max(0, detalle.remainingBalance - montoNum);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 16) + 32 }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={manejarRecarga}
          tintColor={colors.primary}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* Cabecera de la Orden */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Orden #{detalle.serviceId}</Text>
          <Text style={styles.dateText}>Registrada: {formatearFecha(detalle.serviceCreatedAt)}</Text>
        </View>

        <View style={[styles.badge, getStatusBadgeStyle(detalle.paymentStatus)]}>
          <Text style={styles.badgeText}>{getStatusLabel(detalle.paymentStatus)}</Text>
        </View>
      </View>

      {/* Tarjeta de Cliente y Vehículo */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cliente y Vehículo</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cliente:</Text>
          <Text style={styles.detailValue}>{detalle.client?.name || 'No especificado'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Teléfono:</Text>
          <Text style={styles.detailValue}>{detalle.client?.phone || 'No registrado'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Motocicleta:</Text>
          <Text style={styles.detailValue}>
            {detalle.motorcycle?.brand} {detalle.motorcycle?.model} ({detalle.motorcycle?.licensePlate || 'Sin placa'})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Trabajo realizado:</Text>
          <Text style={styles.detailValue}>{detalle.serviceDescription}</Text>
        </View>
      </View>

      {/* Tarjeta de Resumen Financiero */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Balance de la Orden</Text>

        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Mano de obra:</Text>
          <Text style={styles.financeValue}>${detalle.laborCost.toFixed(2)}</Text>
        </View>

        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Repuestos y materiales:</Text>
          <Text style={styles.financeValue}>+${detalle.partsCost.toFixed(2)}</Text>
        </View>

        <View style={styles.financeDivider} />

        <View style={styles.financeRow}>
          <Text style={styles.totalOrderLabel}>Total Facturado:</Text>
          <Text style={styles.totalOrderValue}>${detalle.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.financeRow}>
          <Text style={styles.paidLabel}>Total Abonado:</Text>
          <Text style={styles.paidValue}>-${detalle.totalPaid.toFixed(2)}</Text>
        </View>

        <View style={styles.financeDivider} />

        <View style={styles.balanceHighlightRow}>
          <Text style={styles.balanceHighlightLabel}>SALDO PENDIENTE:</Text>
          <Text
            style={[
              styles.balanceHighlightValue,
              detalle.remainingBalance > 0 ? styles.balanceDanger : styles.balanceSuccess
            ]}
          >
            ${detalle.remainingBalance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Formulario para Registrar Pago (solo si hay saldo pendiente) */}
      {detalle.remainingBalance > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registrar Abono o Pago</Text>

          <View style={styles.amountHeaderRow}>
            <Text style={styles.inputLabel}>Monto a Abonar ($)</Text>
            <TouchableOpacity style={styles.quickPayButton} onPress={aplicarSaldoRestante}>
              <Text style={styles.quickPayButtonText}>Pagar saldo restante</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
          />

          <Text style={styles.inputLabel}>Método de Pago</Text>
          <View style={styles.methodsRow}>
            {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map((m) => {
              const isActive = metodoPago === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodButton, isActive && styles.methodButtonActive]}
                  onPress={() => setMetodoPago(m)}
                >
                  <View style={styles.methodButtonInner}>
                    {m === 'EFECTIVO' ? (
                      <CashIcon size={14} color={isActive ? colors.textDark : colors.textSecondary} />
                    ) : m === 'TARJETA' ? (
                      <CardIcon size={14} color={isActive ? colors.textDark : colors.textSecondary} />
                    ) : (
                      <BankIcon size={14} color={isActive ? colors.textDark : colors.textSecondary} />
                    )}
                    <Text style={[styles.methodButtonText, isActive && styles.methodButtonTextActive]}>
                      {m === 'EFECTIVO' ? 'Efectivo' : m === 'TARJETA' ? 'Tarjeta' : 'Transf.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Notas / Referencia (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Comprobante #1234, abono 50%"
            placeholderTextColor={colors.textMuted}
            value={notas}
            onChangeText={setNotas}
          />

          {montoNum > 0 && (
            <View style={styles.projectionBox}>
              <Text style={styles.projectionText}>
                Nuevo saldo tras este pago: ${nuevoSaldoProyectado.toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, guardandoPago && styles.buttonDisabled]}
            onPress={manejarRegistroPago}
            disabled={guardandoPago}
          >
            {guardandoPago ? (
              <ActivityIndicator size="small" color={colors.charcoal} />
            ) : (
              <Text style={styles.primaryButtonText}>Confirmar y Registrar Pago</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fullyPaidBanner}>
          <CheckCircleIcon size={24} color={colors.success} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.fullyPaidTitle}>Orden Totalmente Pagada</Text>
            <Text style={styles.fullyPaidSub}>No quedan saldos pendientes para este servicio.</Text>
          </View>
        </View>
      )}

      {/* Historial de Pagos de Esta Orden */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de Pagos de la Orden ({detalle.payments?.length || 0})</Text>

        {detalle.payments && detalle.payments.length > 0 ? (
          detalle.payments.map((p) => (
            <View key={p.id} style={styles.paymentItem}>
              <View style={styles.paymentItemLeft}>
                <Text style={styles.paymentItemAmount}>+${p.amount.toFixed(2)}</Text>
                <Text style={styles.paymentItemDate}>{formatearFecha(p.date || p.createdAt)}</Text>
                {p.notes ? <Text style={styles.paymentItemNotes}>Nota: {p.notes}</Text> : null}
              </View>

              <View style={styles.paymentMethodBadge}>
                <Text style={styles.paymentMethodText}>{p.paymentMethod}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyPaymentsText}>
            Aún no se han registrado abonos o pagos para esta orden.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  financeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  financeValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  totalOrderLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalOrderValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  paidLabel: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },
  paidValue: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
  },
  financeDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  balanceHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceHighlightLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceHighlightValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceDanger: {
    color: colors.danger,
  },
  balanceSuccess: {
    color: colors.success,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  quickPayButton: {
    backgroundColor: '#EEF2F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quickPayButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  methodButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  methodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#EDFAF4',
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  methodButtonTextActive: {
    color: colors.text,
    fontWeight: 'bold',
  },
  projectionBox: {
    backgroundColor: '#F5FAF7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4EFE4',
  },
  projectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: colors.charcoal,
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullyPaidBanner: {
    backgroundColor: '#E6F9F0',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fullyPaidTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 4,
  },
  fullyPaidSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  paymentItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  paymentItemDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  paymentItemNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  paymentMethodBadge: {
    backgroundColor: '#F0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  emptyPaymentsText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
