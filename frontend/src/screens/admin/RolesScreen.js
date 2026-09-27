import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import { getAllRoles, deleteRole } from '../../services/roleService';
import { handleApiError } from '../../utils/errorHandler';

export default function RolesScreen({ navigation }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Roles', 'No se pudieron cargar los roles del sistema');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoles();
    }, [])
  );

  const handleDeleteRole = (role) => {
    if (role.id === 1) {
      Alert.alert('Acción no permitida', 'No puedes eliminar el rol de Administrador principal.');
      return;
    }

    Alert.alert(
      'Eliminar Rol',
      `¿Estás seguro de que deseas eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRole(role.id);
              Alert.alert('Éxito', 'Rol eliminado correctamente');
              await loadRoles();
            } catch (error) {
              handleApiError(error, 'Error al Eliminar Rol', 'No se pudo eliminar el rol');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roles y Permisos del Sistema</Text>
      <Text style={styles.subtitle}>
        Crea roles personalizados y define a qué módulos y acciones tiene acceso cada uno.
      </Text>

      <TouchableOpacity
        style={styles.btnNewRole}
        onPress={() => navigation.navigate('RoleForm')}
      >
        <Text style={styles.btnNewRoleText}>+ Crear Nuevo Rol</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.roleCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.roleName}>{item.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.permissions_count || 0} permisos
                  </Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.roleDescription}>{item.description}</Text>
              ) : (
                <Text style={styles.noDescription}>Sin descripción definida</Text>
              )}

              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={styles.btnEdit}
                  onPress={() => navigation.navigate('RoleForm', { roleId: item.id })}
                >
                  <Text style={styles.btnEditText}>Editar Permisos</Text>
                </TouchableOpacity>

                {item.id !== 1 && (
                  <TouchableOpacity
                    style={styles.btnDelete}
                    onPress={() => handleDeleteRole(item)}
                  >
                    <Text style={styles.btnDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay roles registrados en el sistema.</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16
  },
  btnNewRole: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  btnNewRoleText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 16
  },
  loading: {
    marginTop: 40
  },
  roleCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'bold'
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12
  },
  noDescription: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 12
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10
  },
  btnEdit: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnEditText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  },
  btnDelete: {
    paddingHorizontal: 16,
    backgroundColor: colors.danger,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnDeleteText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 30,
    fontSize: 15
  }
});
