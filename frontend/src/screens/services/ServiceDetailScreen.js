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
    try {
      if (!description.trim()) {
        Alert.alert('Aviso', 'La descripción es obligatoria');
        return;
      }

      if (!cost || Number(cost) < 0) {
        Alert.alert('Aviso', 'Ingrese un costo válido');
        return;
      }

      const updatedService = await updateService(service.id, {
        motorcycleId: service.motorcycleId,
        description: description.trim(),
        cost: Number(cost),
      });

      setService(updatedService);
      setEditing(false);

      Alert.alert('Éxito', 'Servicio actualizado correctamente');
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar el servicio'
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
        error.response?.data?.message || 'No se pudo cambiar el estado'
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Orden #{service.id}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Motocicleta
        </Text>

        <Text style={styles.value}>
          #{service.motorcycleId}
        </Text>

        <Text style={styles.label}>
          Estado
        </Text>

        <Text style={styles.value}>
          {getStatusText(service.status)}
        </Text>

        <Text style={styles.label}>
          Descripción
        </Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        ) : (
          <Text style={styles.value}>
            {service.description}
          </Text>
        )}

        <Text style={styles.label}>
          Costo
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

      {editing ? (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>
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
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.buttonText}>
            Editar servicio
          </Text>
        </TouchableOpacity>
      )}

      {service.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            handleStatusChange('IN_PROGRESS')
          }
        >
          <Text style={styles.buttonText}>
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
          <Text style={styles.buttonText}>
            Finalizar servicio
          </Text>
        </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
  },

  value: {
    color: colors.text,
    fontSize: 16,
  },

  cost: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },

  dangerButton: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },

  dangerButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },

  text: {
    color: colors.text,
  },
});