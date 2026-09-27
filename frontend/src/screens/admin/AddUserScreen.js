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
import { getAllRoles } from '../../services/roleService';
import { createUser } from '../../services/userService';
import { handleApiError } from '../../utils/errorHandler';

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await getAllRoles();
        setRoles(data);
        if (data.length > 0) {
          // Por defecto seleccionar el rol de Mecánico o el segundo disponible
          const defaultRole = data.find((r) => r.id === 2) || data[0];
          setSelectedRoleId(defaultRole.id);
        }
      } catch (error) {
        handleApiError(error, 'Error al Cargar Roles', 'No se pudieron cargar los roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre completo del usuario.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Ingresa un correo electrónico.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!selectedRoleId) {
      Alert.alert('Rol requerido', 'Selecciona un rol para este usuario.');
      return;
    }

    try {
      setSaving(true);
      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role_id: selectedRoleId
      });

      Alert.alert('Éxito', 'Usuario creado correctamente.');
      navigation.goBack();
    } catch (error) {
      handleApiError(error, 'Error al Crear Usuario', 'No se pudo registrar el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Registrar Nuevo Usuario</Text>
      <Text style={styles.subtitle}>
        Crea una cuenta para un integrante del taller y asígnale su rol con los permisos correspondientes.
      </Text>

      {/* Nombre */}
      <Text style={styles.label}>Nombre Completo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Carlos Ramírez"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      {/* Correo */}
      <Text style={styles.label}>Correo Electrónico *</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@taller.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Contraseña */}
      <Text style={styles.label}>Contraseña *</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Selector de Rol */}
      <Text style={[styles.label, { marginTop: 12 }]}>Seleccionar Rol *</Text>
      <Text style={styles.roleHelp}>
        El rol determinará a qué pantallas y funciones tendrá acceso este usuario.
      </Text>

      <View style={styles.rolesList}>
        {roles.map((r) => {
          const isSelected = selectedRoleId === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.roleCard, isSelected && styles.roleCardSelected]}
              onPress={() => setSelectedRoleId(r.id)}
              activeOpacity={0.7}
            >
              <View style={styles.roleCardHeader}>
                <Text style={[styles.roleName, isSelected && styles.roleNameSelected]}>
                  {r.name}
                </Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </View>
              {r.description ? (
                <Text style={styles.roleDesc}>{r.description}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botón de Enviar */}
      <TouchableOpacity
        style={[styles.btnSubmit, saving && styles.btnDisabled]}
        onPress={handleCreateUser}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <Text style={styles.btnSubmitText}>Registrar Usuario</Text>
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
  roleHelp: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12
  },
  rolesList: {
    gap: 10,
    marginBottom: 20
  },
  roleCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14
  },
  roleCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F3FAF6'
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  roleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  roleNameSelected: {
    color: colors.textDark
  },
  roleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioCircleSelected: {
    borderColor: colors.primary
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  btnSubmitText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnDisabled: {
    opacity: 0.6
  }
});
