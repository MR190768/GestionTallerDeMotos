import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => Alert.alert('Nuevo Usuario', 'Formulario para nuevo usuario')}
      >
        <Text style={styles.primaryButtonText}>+ Registrar Nuevo Usuario</Text>
      </TouchableOpacity>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <View style={styles.badge}>
                <Text style={styles.roleText}>Rol: {item.role}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: colors.background 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 6,
    color: colors.text 
  },
  subtitle: { 
    fontSize: 15, 
    color: colors.textSecondary, 
    marginBottom: 20 
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15
  },
  userCard: { 
    padding: 16, 
    backgroundColor: colors.card, 
    marginBottom: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  name: { 
    fontWeight: 'bold', 
    fontSize: 16,
    color: colors.text
  },
  email: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 14
  },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  roleText: { 
    color: colors.primary, 
    fontWeight: '600',
    fontSize: 13
  }
});