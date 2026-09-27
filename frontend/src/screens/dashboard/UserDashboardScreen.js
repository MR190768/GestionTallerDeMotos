import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

// Catálogo de módulos del sistema vinculados a sus respectivos permisos
const SYSTEM_MODULES = [
  {
    permission: 'manage_clients',
    title: 'Gestión de Clientes',
    description: 'Registrar, editar y buscar fichas de clientes del taller.',
    screen: 'Client',
    tag: '👥 Clientes'
  },
  {
    permission: 'manage_motorcycles',
    title: 'Gestión de Motocicletas',
    description: 'Consultar y registrar motos, placas y clientes propietarios.',
    screen: 'Motorcycles',
    tag: '🏍️ Motos'
  },
  {
    permission: 'manage_services',
    title: 'Órdenes de Servicio',
    description: 'Control de reparaciones, diagnósticos y mantenimientos activos.',
    screen: 'Services',
    tag: '🔧 Servicios'
  },
  {
    permission: 'manage_parts',
    title: 'Repuestos e Inventario',
    description: 'Consulta de piezas disponibles, stock y precios de repuestos.',
    screen: 'Parts',
    tag: '⚙️ Repuestos'
  },
  {
    permission: 'manage_finances',
    title: 'Finanzas y Pagos',
    description: 'Control de deudas de clientes, cobros y registro de abonos.',
    screen: 'Debts',
    tag: '💰 Finanzas'
  },
  {
    permission: 'manage_users',
    title: 'Gestión de Usuarios',
    description: 'Administración de cuentas de acceso del personal del taller.',
    screen: 'AdminDashboard',
    tag: '👤 Usuarios'
  },
  {
    permission: 'manage_roles',
    title: 'Roles y Permisos',
    description: 'Configuración de roles y asignación de permisos del sistema.',
    screen: 'Roles',
    tag: '🛡️ Roles'
  }
];

export default function UserDashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  const userPermissions = Array.isArray(userInfo?.permissions) ? userInfo.permissions : [];

  // Filtrar los módulos a los que el usuario tiene acceso según sus permisos asignados
  const allowedModules = SYSTEM_MODULES.filter((mod) =>
    userPermissions.includes(mod.permission)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Encabezado del Perfil del Usuario */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>¡Hola, {userInfo?.name || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Panel de Control y Operaciones</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{userInfo?.role || 'Personal'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Módulos Habilitados ({allowedModules.length})
      </Text>

      {/* Lista de Módulos Activos con Botones Dinámicos */}
      {allowedModules.length > 0 ? (
        <View style={styles.modulesGrid}>
          {allowedModules.map((item) => (
            <View key={item.permission} style={styles.moduleCard}>
              <View style={styles.cardTop}>
                <Text style={styles.moduleTag}>{item.tag}</Text>
                <Text style={styles.moduleTitle}>{item.title}</Text>
              </View>

              <Text style={styles.moduleDesc}>{item.description}</Text>

              <TouchableOpacity
                style={styles.btnAction}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnActionText}>Ingresar al Módulo →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin Módulos Asignados</Text>
          <Text style={styles.emptyText}>
            Tu rol actual ({userInfo?.role || 'Sin rol'}) no tiene permisos asignados para acceder a módulos del taller.
          </Text>
          <Text style={styles.emptyHelp}>
            Ponte en contacto con un Administrador para que configure los permisos de tu rol.
          </Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  greeting: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: colors.text,
    marginBottom: 2
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.textSecondary 
  },
  roleBadge: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14
  },
  roleBadgeText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14
  },
  modulesGrid: {
    gap: 14
  },
  moduleCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardTop: {
    marginBottom: 6
  },
  moduleTag: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text
  },
  moduleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18
  },
  btnAction: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnActionText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20
  },
  emptyHelp: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});
