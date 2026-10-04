import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import {
  UsersIcon,
  MotorcycleIcon,
  WrenchIcon,
  PackageIcon,
  CashIcon,
  UserIcon,
  ShieldIcon,
  ChevronRightIcon
} from '../../components/common/AppIcons';

// Catálogo de módulos del sistema vinculados a sus respectivos permisos e iconos SVG
const SYSTEM_MODULES = [
  {
    permission: 'manage_clients',
    title: 'Gestión de Clientes',
    description: 'Registrar, editar y buscar fichas de clientes del taller.',
    screen: 'Client',
    tag: 'Clientes',
    icon: UsersIcon
  },
  {
    permission: 'manage_motorcycles',
    title: 'Gestión de Motocicletas',
    description: 'Consultar y registrar motos, placas y clientes propietarios.',
    screen: 'Motorcycles',
    tag: 'Motos',
    icon: MotorcycleIcon
  },
  {
    permission: 'manage_services',
    title: 'Órdenes de Servicio',
    description: 'Control de reparaciones, diagnósticos y mantenimientos activos.',
    screen: 'Services',
    tag: 'Servicios',
    icon: WrenchIcon
  },
  {
    permission: 'manage_parts',
    title: 'Repuestos e Inventario',
    description: 'Consulta de piezas disponibles, stock y precios de repuestos.',
    screen: 'Parts',
    tag: 'Repuestos',
    icon: PackageIcon
  },
  {
    permission: 'manage_finances',
    title: 'Finanzas y Pagos',
    description: 'Control de deudas de clientes, cobros y registro de abonos.',
    screen: 'Debts',
    tag: 'Finanzas',
    icon: CashIcon
  },
  {
    permission: 'manage_users',
    title: 'Gestión de Personal',
    description: 'Administración de cuentas de acceso del personal del taller.',
    screen: 'AdminDashboard',
    tag: 'Usuarios',
    icon: UserIcon
  },
  {
    permission: 'manage_roles',
    title: 'Roles y Permisos',
    description: 'Configuración de roles y asignación de permisos del sistema.',
    screen: 'Roles',
    tag: 'Roles',
    icon: ShieldIcon
  }
];

export default function UserDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);

  const userPermissions = Array.isArray(userInfo?.permissions) ? userInfo.permissions : [];

  // Filtrar los módulos a los que el usuario tiene acceso según sus permisos asignados
  const allowedModules = SYSTEM_MODULES.filter((mod) =>
    userPermissions.includes(mod.permission)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 16) + 32 }
      ]}
    >
      {/* Encabezado del Perfil del Usuario */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>¡Hola, {userInfo?.name || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Panel de Control y Operaciones</Text>
        </View>
        <View style={styles.roleBadge}>
          <ShieldIcon size={14} color={colors.textDark} />
          <Text style={styles.roleBadgeText}>{userInfo?.role || 'Personal'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Módulos Habilitados ({allowedModules.length})
      </Text>

      {/* Lista de Módulos Activos con Botones Dinámicos */}
      {allowedModules.length > 0 ? (
        <View style={styles.modulesGrid}>
          {allowedModules.map((item) => {
            const IconComponent = item.icon;
            return (
              <View key={item.permission} style={styles.moduleCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconAvatar}>
                    <IconComponent size={22} color={colors.textDark} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.moduleTag}>{item.tag.toUpperCase()}</Text>
                    <Text style={styles.moduleTitle}>{item.title}</Text>
                  </View>
                </View>

                <Text style={styles.moduleDesc}>{item.description}</Text>

                <TouchableOpacity
                  style={styles.btnAction}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnActionText}>Ingresar al Módulo</Text>
                  <ChevronRightIcon size={16} color={colors.textDark} />
                </TouchableOpacity>
              </View>
            );
          })}
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
    padding: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  iconAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  moduleTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  moduleTitle: {
    fontSize: 16,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  btnActionText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
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
