import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../../theme/colors';
import { getAllServices } from '../../services/serviceOrderService';
import { handleApiError } from '../../utils/errorHandler';
import {
  PlusIcon,
  MotorcycleIcon,
  UserIcon
} from '../../components/common/AppIcons';

export default function ServicesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      const data = await getAllServices(filter);
      setServices(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Órdenes', 'No se pudieron cargar las órdenes de servicio');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  // Actualiza las órdenes cada vez que se vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [loadServices])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
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

  const renderService = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() =>
      navigation.navigate('ServiceDetail', {
        serviceId: item.id,
      })
    }
  >
    <View style={styles.cardHeader}>
      <Text style={styles.serviceId}>
        Orden #{item.id}
      </Text>

      <View
        style={[
          styles.statusBadge,
          getStatusStyle(item.status),
        ]}
      >
        <Text style={styles.statusText}>
          {getStatusText(item.status)}
        </Text>
      </View>
    </View>

    <View style={styles.cardInfoRow}>
      <MotorcycleIcon size={14} color={colors.textSecondary} />
      <Text style={styles.motorcycleName}>
        {item.motorcycleBrand} {item.motorcycleModel} ({item.licensePlate || 'Sin placa'})
      </Text>
    </View>

    <View style={styles.cardInfoRow}>
      <UserIcon size={14} color={colors.textSecondary} />
      <Text style={styles.secondaryInfo}>
        {item.clientName}
      </Text>
    </View>

    <Text style={styles.description}>
      {item.description}
    </Text>

    <Text style={styles.cost}>
      Total: ${Number(item.totalCost ?? item.cost).toFixed(2)}
      {Number(item.partsCost) > 0 ? ` (inc. $${Number(item.partsCost).toFixed(2)} repuestos)` : ''}
    </Text>
  </TouchableOpacity>
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Cargando órdenes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Órdenes de Servicio
      </Text>

      {/* Botón para crear una nueva orden */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateService')}
        activeOpacity={0.7}
      >
        <PlusIcon size={16} color={colors.textDark} />
        <Text style={styles.createButtonText}>
          Nueva Orden
        </Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filters}>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'ACTIVE' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('ACTIVE')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'ACTIVE' && styles.filterTextActive,
            ]}
          >
            Activas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'PENDING' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('PENDING')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'PENDING' && styles.filterTextActive,
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'IN_PROGRESS' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('IN_PROGRESS')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'IN_PROGRESS' && styles.filterTextActive,
            ]}
          >
            En proceso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'COMPLETED' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('COMPLETED')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'COMPLETED' && styles.filterTextActive,
            ]}
          >
            Completadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'CANCELLED' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('CANCELLED')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'CANCELLED' && styles.filterTextActive,
            ]}
          >
            Canceladas
          </Text>
        </TouchableOpacity>

      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderService}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 30
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay órdenes para mostrar
          </Text>
        }
      />

    </View>
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

  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },

  createButton: {
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },

  createButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 16,
  },

  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  filterButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    color: colors.text,
    fontSize: 13,
  },

  filterTextActive: {
    color: colors.textDark,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  serviceId: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  description: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 8,
  },

  motorcycle: {
    color: colors.textSecondary,
    marginBottom: 4,
  },

  cost: {
    color: colors.text,
    fontWeight: 'bold',
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  statusBadge: {
  borderWidth: 1,
  borderRadius: 16,
  paddingVertical: 4,
  paddingHorizontal: 10,
},

statusPending: {
  backgroundColor: colors.surface,
  borderColor: colors.border,
},

statusProgress: {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
},

statusCompleted: {
  backgroundColor: colors.success,
  borderColor: colors.success,
},

statusCancelled: {
  backgroundColor: colors.danger,
  borderColor: colors.danger,
},

statusText: {
  color: colors.text,
  fontSize: 12,
  fontWeight: 'bold',
},

motorcycleName: {
  color: colors.text,
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
},

secondaryInfo: {
  color: colors.textSecondary,
  fontSize: 13,
  marginBottom: 3,
},
});