import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'react-native';
import colors from '../theme/colors';

// Pantallas Administrativas y de Usuarios
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AddUserScreen from '../screens/admin/AddUserScreen';
import RolesScreen from '../screens/admin/RolesScreen';
import RoleFormScreen from '../screens/admin/RoleFormScreen';

// Pantallas Operativas (Taller / Módulos)
import UserDashboardScreen from '../screens/dashboard/UserDashboardScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import ClientInformationScreen from '../screens/clients/ClientInformationScreen';
import MotorcyclesScreen from '../screens/motorcycles/MotorcyclesScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import PartsScreen from '../screens/parts/PartsScreen';
import DebtsScreen from '../screens/debts/DebtsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { userInfo, logout } = useContext(AuthContext);

  const isAdmin =
    userInfo?.roleId === 1 ||
    userInfo?.role?.toLowerCase() === 'admin' ||
    userInfo?.role?.toLowerCase() === 'administrador';

  const initialRouteName = isAdmin ? 'AdminDashboard' : 'UserDashboard';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.textLight,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <Button title="Cerrar Sesión" color={colors.danger} onPress={logout} />
      }}
    >
      {/* Dashboards de inicio */}
      <Stack.Screen
        name="UserDashboard"
        component={UserDashboardScreen}
        options={{ title: 'Panel de Control' }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={UserManagementScreen}
        options={{ title: 'Panel de Administración' }}
      />

      {/* Módulo de Clientes */}
      <Stack.Screen
        name="Client"
        component={ClientsScreen}
        options={{ title: 'Gestión de Clientes' }}
      />
      <Stack.Screen
        name="ClientInformation"
        component={ClientInformationScreen}
        options={{ title: 'Información del Cliente' }}
      />
      <Stack.Screen
        name="AddClient"
        component={AddClientScreen}
        options={{ title: 'Agregar Cliente' }}
      />

      {/* Módulo de Motocicletas */}
      <Stack.Screen
        name="Motorcycles"
        component={MotorcyclesScreen}
        options={{ title: 'Motocicletas' }}
      />

      {/* Módulo de Servicios */}
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: 'Órdenes de Servicio' }}
      />

      {/* Módulo de Repuestos */}
      <Stack.Screen
        name="Parts"
        component={PartsScreen}
        options={{ title: 'Repuestos e Inventario' }}
      />

      {/* Módulo de Finanzas */}
      <Stack.Screen
        name="Debts"
        component={DebtsScreen}
        options={{ title: 'Finanzas y Deudas' }}
      />

      {/* Módulos de Administración */}
      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{ title: 'Registrar Usuario' }}
      />
      <Stack.Screen
        name="Roles"
        component={RolesScreen}
        options={{ title: 'Gestión de Roles' }}
      />
      <Stack.Screen
        name="RoleForm"
        component={RoleFormScreen}
        options={{ title: 'Configurar Rol' }}
      />
    </Stack.Navigator>
  );
}