import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, Alert } from 'react-native';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function UserManagementScreen() {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      setUsers(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola, Administrador {userInfo?.name}!</Text>
      <Text style={styles.subtitle}>Gestión de Usuarios del Taller</Text>
      <Button title="Registrar Nuevo Usuario" onPress={() => Alert.alert('Navegar', 'Pantalla de registro de usuario')} />
      
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.email}</Text>
              <Text style={styles.role}>Rol: {item.role}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: colors.secondary, marginBottom: 20 },
  userCard: { padding: 15, backgroundColor: colors.white, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  name: { fontWeight: 'bold', fontSize: 16 },
  role: { marginTop: 5, color: colors.primary, fontWeight: '500' }
});