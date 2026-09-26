import React, { useState, useEffect } from 'react';
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
} from '../../services/clientService';

export default function ClientsScreen({navigation}) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Cargar Clientes ---
  const loadClients = async () => {
    try {
      setLoading(true);

      const data = await getAllClients();

      setClients(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Error al cargar los clientes'
      );
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
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Error al buscar clientes'
      );
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
            Alert.alert(
              'Error',
              error.response?.data?.error ||
                'No se pudo eliminar el cliente'
            );
          }
        },
      },
    ]
  );
};


   useEffect(() => {
    loadClients();
  }, []);

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.search}
        placeholder="Buscar por nombre, correo, teléfono o dirección"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={handleSearch}
      />

      <TouchableOpacity style = {styles.btnNewClient} onPress = {() => navigation.navigate('AddClient')}>
        <Text style={styles.btnNewClientText}>
            Agregar nuevo cliente
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.clientCard} onPress = {() => navigation.navigate('ClientInformation', {clientId : item.id})}>
              <Text style={styles.clientName}>{item.name}</Text>

              {item.email && (
                <Text style={styles.clientInfo}>
                  Correo: {item.email}
                </Text>
              )}

              <Text style={styles.clientInfo}>
                Teléfono: {item.phone}
              </Text>

              {item.address && (
                <Text style={styles.clientInfo}>
                  Dirección: {item.address}
                </Text>
              )}

              <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteClient(item)}>
                <Text style={styles.btnDeleteText}>
                  Eliminar
                </Text>
              </TouchableOpacity>
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
  btnNewClient: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  btnNewClientText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15
  }
});