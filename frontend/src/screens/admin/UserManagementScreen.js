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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { getAllUsers, deleteUser } from '../../services/userService';
import { handleApiError, getErrorMessage } from '../../utils/errorHandler';
import {
  UsersIcon,
  MotorcycleIcon,
  WrenchIcon,
  PackageIcon,
  CashIcon,
  ClipboardIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon
} from '../../components/common/AppIcons';

export default function UserManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'No se pudo obtener la lista de usuarios.'));
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
    { title: 'Clientes', screen: 'Client', icon: UsersIcon },
    { title: 'Motos', screen: 'Motorcycles', icon: MotorcycleIcon },
    { title: 'Servicios', screen: 'Services', icon: WrenchIcon },
    { title: 'Repuestos', screen: 'Parts', icon: PackageIcon },
    { title: 'Finanzas', screen: 'Debts', icon: CashIcon },
    { title: 'Panel Operativo', screen: 'UserDashboard', icon: ClipboardIcon }
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
          activeOpacity={0.7}
        >
          <PlusIcon size={16} color={colors.textDark} />
          <Text style={styles.primaryButtonText}>Registrar Usuario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rolesButton}
          onPress={() => navigation.navigate('Roles')}
          activeOpacity={0.7}
        >
          <ShieldIcon size={16} color={colors.text} />
          <Text style={styles.rolesButtonText}>Gestionar Roles</Text>
        </TouchableOpacity>
      </View>

      {/* Módulos Operativos de Acceso Rápido */}
      <Text style={styles.subSectionTitle}>Acceso Directo a Módulos del Taller</Text>
      <View style={styles.moduleShortcutsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsScroll}>
          {operationalModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <TouchableOpacity
                key={mod.screen}
                style={styles.shortcutChip}
                onPress={() => navigation.navigate(mod.screen)}
                activeOpacity={0.7}
              >
                <Icon size={15} color={colors.text} />
                <Text style={styles.shortcutText}>{mod.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.sectionHeader}>Personal Registrado ({users.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.btnRetry} onPress={fetchUsers}>
            <Text style={styles.btnRetryText}>Reintentar Carga</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 16) + 30
          }}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                <View style={styles.badge}>
                  <ShieldIcon size={12} color={colors.textDark} />
                  <Text style={styles.roleText}>{item.role_name}</Text>
                </View>
              </View>

              {item.id !== 1 && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.btnDelete}
                    onPress={() => handleDeleteUser(item)}
                    activeOpacity={0.7}
                  >
                    <TrashIcon size={14} color={colors.white} />
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
    padding: 18,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
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
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  primaryButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 13
  },
  rolesButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  rolesButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 13
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8
  },
  moduleShortcutsRow: {
    marginBottom: 16
  },
  shortcutsScroll: {
    gap: 8
  },
  shortcutChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  shortcutText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10
  },
  userCard: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    borderRadius: 10,
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
    fontSize: 15,
    color: colors.text
  },
  email: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 13
  },
  badge: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  roleText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 11
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8
  },
  btnDelete: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
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
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10
  },
  btnRetry: {
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  btnRetryText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12
  }
});