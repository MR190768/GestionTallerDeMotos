import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import {
  getAllMotorcycles,
  deleteMotorcycle
} from '../../services/motorcycleService';
import { handleApiError } from '../../utils/errorHandler';

export default function MotorcyclesScreen({ navigation }) {
  const [motorcycles, setMotorcycles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar motocicletas desde el backend
  const loadMotorcycles = async (searchTerm = search) => {
    try {
      setLoading(true);
      const data = await getAllMotorcycles(searchTerm);
      setMotorcycles(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Motocicletas', 'No se pudieron cargar las motocicletas del taller');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMotorcycles(search);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMotorcycles(search);
  };

  const handleSearch = (text) => {
    setSearch(text);
    loadMotorcycles(text);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Eliminar Motocicleta',
      `¿Deseas eliminar la motocicleta con placa ${item.licensePlate} (${item.brand} ${item.model})?\n\nEsta acción también eliminará su historial de servicios asociado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMotorcycle(item.id);
              Alert.alert('Éxito', 'Motocicleta eliminada correctamente.');
              loadMotorcycles(search);
            } catch (error) {
              handleApiError(error, 'Error al Eliminar', 'No se pudo eliminar la motocicleta');
            }
          }
        }
      ]
    );
  };

  const renderMotorcycleItem = ({ item }) => {
    const serviceCount = Number(item.serviceCount) || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MotorcycleDetail', { motorcycleId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{item.licensePlate}</Text>
          </View>
          <Text style={styles.brandTitle}>
            {item.brand} {item.model}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Año:</Text>
            <Text style={styles.detailValue}>{item.year || 'No especificado'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Propietario:</Text>
            <Text style={styles.clientName}>{item.clientName || 'Sin asignar'}</Text>
          </View>

          {item.clientPhone ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Teléfono:</Text>
              <Text style={styles.detailValue}>{item.clientPhone}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.servicesBadge}>
            <Text style={styles.servicesText}>
              🔧 {serviceCount} {serviceCount === 1 ? 'servicio' : 'servicios'}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.btnActionEdit}
              onPress={() => navigation.navigate('MotorcycleForm', { motorcycleId: item.id })}
            >
              <Text style={styles.btnActionEditText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActionDelete}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.btnActionDeleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra Superior con Buscador y Botón de Registro */}
      <View style={styles.topSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa, marca, modelo o cliente..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => handleSearch('')}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => navigation.navigate('MotorcycleForm')}
        >
          <Text style={styles.btnAddText}>+ Registrar Moto</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Motocicletas */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando motocicletas...</Text>
        </View>
      ) : (
        <FlatList
          data={motorcycles}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMotorcycleItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No se encontraron motocicletas</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? `No hay resultados coincidentes con "${search}"`
                  : 'Aún no hay motocicletas registradas en el taller.'}
              </Text>
              <TouchableOpacity
                style={styles.btnEmptyAdd}
                onPress={() => navigation.navigate('MotorcycleForm')}
              >
                <Text style={styles.btnEmptyAddText}>Registrar la primera motocicleta</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  topSection: {
    padding: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    paddingHorizontal: 12
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 14
  },
  clearSearchBtn: {
    padding: 6
  },
  clearSearchText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnAdd: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnAddText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  plateBadge: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10
  },
  plateText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1
  },
  brandTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  cardBody: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
    marginBottom: 10
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500'
  },
  clientName: {
    fontSize: 13,
    color: colors.text,
    fontWeight: 'bold'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  servicesBadge: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  servicesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8
  },
  btnActionEdit: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  btnActionEditText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600'
  },
  btnActionDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.danger
  },
  btnActionDeleteText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    marginTop: 40
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  btnEmptyAdd: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  btnEmptyAddText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  }
});