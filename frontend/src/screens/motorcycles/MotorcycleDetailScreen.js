import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import {
  getMotorcycleById,
  deleteMotorcycle
} from '../../services/motorcycleService';
import { handleApiError } from '../../utils/errorHandler';

export default function MotorcycleDetailScreen({ route, navigation }) {
  const { motorcycleId } = route.params;
  const [motorcycle, setMotorcycle] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMotorcycle = async () => {
    try {
      setLoading(true);
      const data = await getMotorcycleById(motorcycleId);
      setMotorcycle(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Detalle', 'No se pudo obtener la información de la motocicleta.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMotorcycle();
    }, [motorcycleId])
  );

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Motocicleta',
      `¿Estás seguro de que deseas eliminar la motocicleta ${motorcycle?.brand} ${motorcycle?.model} (${motorcycle?.licensePlate})?\n\nSe eliminarán permanentemente todos sus registros y servicios asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMotorcycle(motorcycleId);
              Alert.alert('Éxito', 'Motocicleta eliminada del sistema.');
              navigation.goBack();
            } catch (error) {
              handleApiError(error, 'Error al Eliminar', 'No se pudo eliminar la motocicleta');
            }
          }
        }
      ]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Pendiente', bg: '#FFF7E6', color: '#D48806' };
      case 'IN_PROGRESS':
        return { text: 'En proceso', bg: '#E6F7FF', color: '#1890FF' };
      case 'COMPLETED':
        return { text: 'Completado', bg: '#F3FAF6', color: colors.primary };
      case 'CANCELLED':
        return { text: 'Cancelado', bg: '#FFF1F0', color: colors.danger };
      default:
        return { text: status || 'Desconocido', bg: '#F5F5F5', color: colors.textSecondary };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando ficha de la motocicleta...</Text>
      </View>
    );
  }

  if (!motorcycle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Motocicleta no encontrada</Text>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnBackText}>Volver a la lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const servicesHistory = motorcycle.servicesHistory || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cabecera Principal con Placa y Datos */}
      <View style={styles.headerCard}>
        <View style={styles.plateContainer}>
          <Text style={styles.plateText}>{motorcycle.licensePlate}</Text>
        </View>
        <Text style={styles.brandTitle}>
          {motorcycle.brand} {motorcycle.model}
        </Text>
        <Text style={styles.yearText}>
          Año: {motorcycle.year || 'No especificado'} • Registrada el {formatDate(motorcycle.createdAt)}
        </Text>
      </View>

      {/* Botones de Acción Rápida */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.btnActionPrimary}
          onPress={() => navigation.navigate('CreateService', {
            preselectedClientId: motorcycle.clientId,
            preselectedMotorcycleId: motorcycle.id
          })}
        >
          <Text style={styles.btnActionPrimaryText}>+ Nueva Orden de Servicio</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.btnActionSecondary}
            onPress={() => navigation.navigate('MotorcycleForm', { motorcycleId: motorcycle.id })}
          >
            <Text style={styles.btnActionSecondaryText}>Editar Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnActionDanger}
            onPress={handleDelete}
          >
            <Text style={styles.btnActionDangerText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjeta del Propietario / Cliente */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👤 Propietario Asociado</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ClientInformation', { clientId: motorcycle.clientId })}
        >
          <Text style={styles.linkText}>Ver Ficha de Cliente →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clientCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValueBold}>{motorcycle.clientName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teléfono:</Text>
          <Text style={styles.infoValue}>{motorcycle.clientPhone || 'No registrado'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Correo:</Text>
          <Text style={styles.infoValue}>{motorcycle.clientEmail || 'No registrado'}</Text>
        </View>

        {motorcycle.clientAddress ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>{motorcycle.clientAddress}</Text>
          </View>
        ) : null}
      </View>

      {/* Historial de Visitas y Órdenes de Servicio */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          🔧 Historial de Visitas y Servicios ({servicesHistory.length})
        </Text>
      </View>

      {servicesHistory.length > 0 ? (
        servicesHistory.map((item) => {
          const badge = getStatusBadge(item.status);
          const cost = Number(item.cost) || 0;

          return (
            <TouchableOpacity
              key={String(item.id)}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceDate}>{formatDate(item.createdAt)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
                </View>
              </View>

              <Text style={styles.serviceDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.serviceFooter}>
                <Text style={styles.serviceCostLabel}>Costo del servicio:</Text>
                <Text style={styles.serviceCostValue}>${cost.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyServicesCard}>
          <Text style={styles.emptyServicesTitle}>Sin Visitas Previas</Text>
          <Text style={styles.emptyServicesText}>
            Esta motocicleta no tiene órdenes de servicio ni visitas registradas en el taller.
          </Text>
          <TouchableOpacity
            style={styles.btnCreateFirstService}
            onPress={() => navigation.navigate('CreateService', {
              preselectedClientId: motorcycle.clientId,
              preselectedMotorcycleId: motorcycle.id
            })}
          >
            <Text style={styles.btnCreateFirstServiceText}>Crear Primera Orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 14
  },
  btnBack: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  btnBackText: {
    color: colors.textDark,
    fontWeight: 'bold'
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  plateContainer: {
    backgroundColor: '#F3FAF6',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 10
  },
  plateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    letterSpacing: 2
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  yearText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  actionsRow: {
    marginBottom: 20,
    gap: 10
  },
  btnActionPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnActionPrimaryText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10
  },
  btnActionSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnActionSecondaryText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13
  },
  btnActionDanger: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnActionDangerText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold'
  },
  clientCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary
  },
  infoValue: {
    fontSize: 13,
    color: colors.text
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  serviceCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  serviceDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 18
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f5f5f5',
    paddingTop: 8
  },
  serviceCostLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  serviceCostValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  emptyServicesCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center'
  },
  emptyServicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 6
  },
  emptyServicesText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18
  },
  btnCreateFirstService: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  btnCreateFirstServiceText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 13
  }
});
