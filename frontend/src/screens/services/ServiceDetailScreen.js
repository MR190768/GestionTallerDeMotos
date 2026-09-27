import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import colors from '../../theme/colors';

import {
  getServiceById,
  updateService,
  updateServiceStatus,
} from '../../services/serviceOrderService';

export default function ServiceDetailScreen({ route }) {
  const { serviceId } = route.params;

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const loadService = async () => {
    try {
      const data = await getServiceById(serviceId);

      setService(data);
      setDescription(data.description);
      setCost(String(data.cost));
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo cargar la orden'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Aviso', 'La descripción es obligatoria');
      return;
    }

    if (!cost || Number(cost) < 0) {
      Alert.alert('Aviso', 'Ingrese un costo válido');
      return;
    }

    try {
      const updatedService = await updateService(service.id, {
        motorcycleId: service.motorcycleId,
        description: description.trim(),
        cost: Number(cost),
      });

      setService(updatedService);
      setEditing(false);

      Alert.alert(
        'Éxito',
        'Servicio actualizado correctamente'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'No se pudo actualizar el servicio'
      );
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const updatedService = await updateServiceStatus(
        service.id,
        status
      );

      setService(updatedService);

      Alert.alert(
        'Éxito',
        'Estado actualizado correctamente'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'No se pudo cambiar el estado'
      );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';

      case 'IN_PROGRESS':
        return 'En proceso';

      case 'COMPLETED':
        return 'Finalizado';

      case 'CANCELLED':
        return 'Cancelado';

      default:
        return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return styles.statusProgress;

      case 'COMPLETED':
        return styles.statusCompleted;

      case 'CANCELLED':
        return styles.statusCancelled;

      default:
        return styles.statusPending;
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Sin fecha';
    }

    return new Date(date).toLocaleString('es-SV');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>
          Orden no encontrada
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Encabezado */}

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>
            Orden #{service.id}
          </Text>

          <Text style={styles.date}>
            {formatDate(service.createdAt)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            getStatusStyle(service.status),
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(service.status)}
          </Text>
        </View>
      </View>

      {/* Motocicleta */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Motocicleta
        </Text>

        <Text style={styles.mainValue}>
          {service.motorcycleBrand} {service.motorcycleModel}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Placa</Text>

          <Text style={styles.value}>
            {service.licensePlate || 'Sin placa'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Año</Text>

          <Text style={styles.value}>
            {service.motorcycleYear || 'No registrado'}
          </Text>
        </View>
      </View>

      {/* Cliente */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Cliente
        </Text>

        <Text style={styles.mainValue}>
          {service.clientName}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Teléfono</Text>

          <Text style={styles.value}>
            {service.clientPhone || 'No registrado'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Correo</Text>

          <Text style={styles.value}>
            {service.clientEmail || 'No registrado'}
          </Text>
        </View>
      </View>

      {/* Servicio */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Trabajo a realizar
        </Text>

        {editing ? (
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        ) : (
          <Text style={styles.description}>
            {service.description}
          </Text>
        )}

        <Text style={styles.costLabel}>
          Costo estimado
        </Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />
        ) : (
          <Text style={styles.cost}>
            ${Number(service.cost).toFixed(2)}
          </Text>
        )}
      </View>

      {/* Edición */}

      {editing ? (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
          >
            <Text style={styles.primaryButtonText}>
              Guardar cambios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setDescription(service.description);
              setCost(String(service.cost));
              setEditing(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>
              Cancelar edición
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        service.status !== 'CANCELLED' && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.secondaryButtonText}>
              Editar servicio
            </Text>
          </TouchableOpacity>
        )
      )}

      {/* Acciones según estado */}

      {service.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            handleStatusChange('IN_PROGRESS')
          }
        >
          <Text style={styles.primaryButtonText}>
            Iniciar trabajo
          </Text>
        </TouchableOpacity>
      )}

      {service.status === 'IN_PROGRESS' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            handleStatusChange('COMPLETED')
          }
        >
          <Text style={styles.primaryButtonText}>
            Finalizar servicio
          </Text>
        </TouchableOpacity>
      )}

      {service.status === 'COMPLETED' && (
        <>
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>
              Servicio finalizado
            </Text>
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() =>
              Alert.alert(
                'Registrar pago',
                'Esta opción será conectada al módulo de pagos.'
              )
            }
          >
            <Text style={styles.paymentButtonText}>
              Registrar pago
            </Text>
          </TouchableOpacity>
        </>
      )}

      {service.status !== 'COMPLETED' &&
        service.status !== 'CANCELLED' && (
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() =>
              handleStatusChange('CANCELLED')
            }
          >
            <Text style={styles.dangerButtonText}>
              Cancelar servicio
            </Text>
          </TouchableOpacity>
        )}

      {service.status === 'CANCELLED' && (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>
            Servicio cancelado
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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

  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  statusPending: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  statusProgress: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  statusCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },

  statusCancelled: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },

  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  mainValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  value: {
    color: colors.text,
    fontSize: 14,
    maxWidth: '65%',
    textAlign: 'right',
  },

  description: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 18,
  },

  costLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },

  cost: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    marginBottom: 12,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  primaryButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 15,
  },

  dangerButton: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  dangerButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },

  completedBox: {
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  completedText: {
    color: colors.text,
    fontWeight: 'bold',
  },

  paymentButton: {
    backgroundColor: colors.headerBackground,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  paymentButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },

  cancelledBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  cancelledText: {
    color: colors.danger,
    fontWeight: 'bold',
  },

  text: {
    color: colors.text,
  },
});