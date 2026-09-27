import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { getAllUsers, deleteUser } from '../../services/userService';
import { handleApiError } from '../../utils/errorHandler';

export default function UserManagementScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Usuarios', 'No se pudo obtener la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDeleteUser = (user) => {
    if (user.id === 1) {
      Alert.alert('Acción no permitida', 'No puedes eliminar al Administrador principal del sistema.');
      return;
    }

    Alert.alert(
      'Eliminar Usuario',
      `¿Deseas eliminar la cuenta de ${user.name}? Esta acción revocará su acceso de inmediato.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Éxito', 'Usuario eliminado correctamente.');
              await fetchUsers();
            } catch (error) {
              handleApiError(error, 'Error al Eliminar', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const operationalModules = [
    { title: 'Clientes', screen: 'Client', tag: '👥 Clientes' },
    { title: 'Motos', screen: 'Motorcycles', tag: '🏍️ Motos' },
    { title: 'Servicios', screen: 'Services', tag: '🔧 Servicios' },
    { title: 'Repuestos', screen: 'Parts', tag: '⚙️ Repuestos' },
    { title: 'Finanzas', screen: 'Debts', tag: '💰 Finanzas' }
  ];

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <Text style={styles.title}>¡Hola, {userInfo?.name || 'Administrador'}!</Text>
      <Text style={styles.subtitle}>Panel de Administración y Control General</Text>

      {/* Acciones de administración */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AddUser')}
        >
          <Text style={styles.primaryButtonText}>+ Registrar Usuario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rolesButton}
          onPress={() => navigation.navigate('Roles')}
        >
          <Text style={styles.rolesButtonText}>Gestionar Roles</Text>
        </TouchableOpacity>
      </View>

      {/* Módulos Operativos de Acceso Rápido */}
      <Text style={styles.subSectionTitle}>Acceso Directo a Módulos del Taller</Text>
      <View style={styles.moduleShortcutsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsScroll}>
          {operationalModules.map((mod) => (
            <TouchableOpacity
              key={mod.screen}
              style={styles.shortcutChip}
              onPress={() => navigation.navigate(mod.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutText}>{mod.tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionHeader}>Usuarios Registrados ({users.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.roleText}>{item.role_name}</Text>
                </View>
              </View>

              {item.id !== 1 && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.btnDelete}
                    onPress={() => handleDeleteUser(item)}
                  >
                    <Text style={styles.btnDeleteText}>Eliminar Usuario</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios registrados en el sistema.</Text>
          }
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  },
  rolesButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center'
  },
  rolesButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8
  },
  moduleShortcutsRow: {
    marginBottom: 18
  },
  shortcutsScroll: {
    gap: 8
  },
  shortcutChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  shortcutText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10
  },
  userCard: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text
  },
  email: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 14
  },
  badge: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  roleText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 12
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    paddingTop: 8
  },
  btnDelete: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.danger
  },
  btnDeleteText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 12
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20
  }
});