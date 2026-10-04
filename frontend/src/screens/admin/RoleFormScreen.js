import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import colors from '../../theme/colors';
import {
  getAllPermissions,
  getRoleById,
  createRole,
  updateRole
} from '../../services/roleService';
import { handleApiError } from '../../utils/errorHandler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon } from '../../components/common/AppIcons';

export default function RoleFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const roleId = route.params?.roleId;
  const isEditing = Boolean(roleId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const perms = await getAllPermissions();
        setAvailablePermissions(perms);

        if (isEditing) {
          const roleData = await getRoleById(roleId);
          setName(roleData.name);
          setDescription(roleData.description || '');
          const currentPermIds = roleData.permissions.map((p) => p.id);
          setSelectedPermissionIds(currentPermIds);
        }
      } catch (error) {
        handleApiError(error, 'Error al Cargar', 'Error al cargar los datos del rol');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const togglePermission = (permId) => {
    if (isEditing && Number(roleId) === 1) {
      Alert.alert('Aviso', 'El rol de Administrador principal posee todos los permisos de forma fija.');
      return;
    }

    if (selectedPermissionIds.includes(permId)) {
      setSelectedPermissionIds(selectedPermissionIds.filter((id) => id !== permId));
    } else {
      setSelectedPermissionIds([...selectedPermissionIds, permId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un nombre para el rol.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissionIds: selectedPermissionIds
      };

      if (isEditing) {
        await updateRole(roleId, payload);
        Alert.alert('Éxito', 'Rol y permisos actualizados correctamente.');
      } else {
        await createRole(payload);
        Alert.alert('Éxito', 'Rol creado exitosamente.');
      }

      navigation.goBack();
    } catch (error) {
      handleApiError(error, 'Error al Guardar Rol', 'No se pudo guardar el rol');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 16) + 32 }
      ]}
    >
      <Text style={styles.title}>
        {isEditing ? 'Editar Rol y Permisos' : 'Crear Nuevo Rol'}
      </Text>
      <Text style={styles.subtitle}>
        Define la identidad del rol y selecciona qué acciones podrá realizar en cada módulo.
      </Text>

      {/* Nombre del rol */}
      <Text style={styles.label}>Nombre del Rol *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Recepcionista, Asesor de Servicio..."
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        editable={Number(roleId) !== 1}
      />

      {/* Descripción */}
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe el propósito o alcance de este rol..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Selector de Permisos agrupados */}
      <Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>
        Permisos del Rol ({selectedPermissionIds.length} seleccionados)
      </Text>

      {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
        <View key={moduleName} style={styles.moduleSection}>
          <Text style={styles.moduleTitle}>Módulo: {moduleName}</Text>
          {perms.map((perm) => {
            const isSelected = selectedPermissionIds.includes(perm.id);
            return (
              <TouchableOpacity
                key={perm.id}
                style={[styles.permItem, isSelected && styles.permItemSelected]}
                onPress={() => togglePermission(perm.id)}
                activeOpacity={0.7}
              >
                <View style={styles.permCheckbox}>
                  {isSelected ? (
                    <CheckIcon size={12} color={colors.textDark} />
                  ) : null}
                </View>
                <View style={styles.permInfo}>
                  <Text style={[styles.permName, isSelected && styles.permNameActive]}>
                    {perm.name}
                  </Text>
                  <Text style={styles.permDesc}>{perm.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Botón de Guardar */}
      <TouchableOpacity
        style={[styles.btnSave, saving && styles.btnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <Text style={styles.btnSaveText}>
            {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
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
    marginBottom: 20
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 16
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  moduleSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  permItemSelected: {
    backgroundColor: '#F3FAF6',
    borderRadius: 6,
    paddingHorizontal: 6
  },
  permCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.white
  },
  checkboxMark: {
    fontSize: 14,
    color: 'transparent'
  },
  checkboxMarkActive: {
    color: colors.primary,
    fontWeight: 'bold'
  },
  permInfo: {
    flex: 1
  },
  permName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  permNameActive: {
    color: colors.textDark
  },
  permDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  btnSave: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  btnSaveText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnDisabled: {
    opacity: 0.6
  }
});
