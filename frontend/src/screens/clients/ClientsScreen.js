import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import colors from '../../theme/colors';
import {
  getAllClients,
  searchClients,
  deleteClient
} from '../../services/clientService';
import { handleApiError } from '../../utils/errorHandler';
import {
  PlusIcon,
  UserIcon,
  SearchIcon
} from '../../components/common/AppIcons';

export default function ClientsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');

  // --- Cargar Clientes ---
  const loadClients = async () => {
    try {
      setLoading(true);

      const data = await getAllClients();

      setClients(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Clientes', 'No se pudieron cargar los clientes del taller');
    } finally {
      setLoading(false);
    }
  };

// --- Buscar Clientes ---
const handleSearch = async (text) => {
    setSearch(text);

    if (!text.trim()) {
      await loadClients();
      return;
    }

    try {
      setLoading(true);

      const data = await searchClients(text);

      setClients(data);
    } catch (error) {
      handleApiError(error, 'Error al Buscar Clientes', 'Ocurrió un error al buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  // --- Eliminar Cliente ---

  const handleDeleteClient = (client) => {
  Alert.alert(
    'Eliminar cliente',
    `¿Seguro que quieres eliminar a ${client.name}? \n\n Eliminar a este cliente eliminara todos sus servicios y motocicletas asociadas \n\n ¿Desea continuar con la eliminacion?`,
    [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Sí',
        style: colors.error,
        onPress: async () => {
          try {
            await deleteClient(client.id);
            await loadClients();
          } catch (error) {
            handleApiError(error, 'Error al Eliminar', 'No se pudo eliminar el cliente');
          }
        },
      },
    ]
  );
};


   useFocusEffect(
  useCallback(() => {
    loadClients();
  }, [])
);

  // --- Logica de los filtros ---
  const filteredClients = clients
    .filter((client) => {
        if (activeFilter === 'deuda') {
            return Number(client.debt) > 0;
        }

        return true;
    })
    .sort((a, b) => {
        if (activeFilter === 'frecuentes') {
            return Number(b.serviceCount) - Number(a.serviceCount);
        }
        if (activeFilter === 'todos') {
            return new Date(a.createdAt) + new Date(b.createdAt);
        }

        return a.name.localeCompare(b.name);
    });

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.search}
        placeholder="Buscar por nombre, correo, teléfono o dirección"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={handleSearch}
      />

      <TouchableOpacity style={styles.btnNewClient} onPress={() => navigation.navigate('AddClient')} activeOpacity={0.7}>
        <PlusIcon size={16} color={colors.textDark} />
        <Text style={styles.btnNewClientText}>
          Agregar nuevo cliente
        </Text>
      </TouchableOpacity>

      <View style={styles.filterContainer}>

        <TouchableOpacity style={[styles.filterButton, activeFilter === 'todos' && styles.activeFilterButton]} onPress={() => setActiveFilter('todos')}>
          <Text style={[styles.filterButtonText, activeFilter === 'todos' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.filterButton, activeFilter === 'deuda' && styles.activeFilterButton]} onPress={() => setActiveFilter('deuda')}>
          <Text style={[styles.filterButtonText, activeFilter === 'deuda' && styles.activeFilterText]}>
            Con deuda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.filterButton, activeFilter === 'frecuentes' && styles.activeFilterButton]} onPress={() => setActiveFilter('frecuentes')}>
          <Text style={[styles.filterButtonText, activeFilter === 'frecuentes' && styles.activeFilterText]}>
            Frecuentes
          </Text>
        </TouchableOpacity>

      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 16) + 30
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.clientCard} onPress = {() => navigation.navigate('ClientInformation', {clientId : item.id})}>
              <Text style={styles.clientName}>{item.name}</Text>

              {item.email && (
                <Text style={styles.clientInfo}>
                  Correo: {item.email}
                </Text>
              )}

              <Text style={styles.clientInfo}>
                Servicios Activos: {item.serviceCount}
              </Text>

              <Text style={styles.clientInfo}>
                Dinero de deuda: ${item.debt}
              </Text>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => navigation.navigate('AddClient', {clientId: item.id})}activeOpacity={0.7}>
                  <Text style={styles.btnEditText}>
                    Editar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteClient(item)}>
                  <Text style={styles.btnDeleteText}>
                   Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron clientes.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    padding: 20
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500'
  },
  clientCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.border
  },
  clientName: {
    fontWeight: 'bold', 
    fontSize: 16,
    color: colors.text
  },
  clientInfo: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 14
  },
  search:{
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.border,
    marginBottom:10
  },
  btnDelete: {
    backgroundColor: colors.danger,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnDeleteText:{
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 15
  },
  btnEdit: {
    backgroundColor: colors.primary,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnEditText:{
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15
  },
  btnNewClient: {
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 15
  },
  btnNewClientText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15
  },
  filterContainer:{
    alignItems:"center",
    flexDirection: "row",
    padding: 5,
    marginBottom: 10
  },
  filterButton: {
    borderWidth: 1,
    marginRight: 15,
    padding: 5,
    borderRadius: 16,
    borderColor: colors.border
  },
  activeFilterButton: {
    backgroundColor:colors.primary,
    marginRight: 15,
    padding: 5,
    borderRadius: 16,
    borderColor: colors.border
  },
  activeFilterText: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  }
});