import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import MechanicDashboardScreen from '../screens/mechanic/MechanicDashboardScreen';
import { Button } from 'react-native';
import colors from '../theme/colors';
import ServicesScreen from '../screens/services/ServicesScreen';
import ServiceDetailScreen from '../screens/services/ServiceDetailScreen';
import CreateServiceScreen from '../screens/services/CreateServiceScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { userInfo, logout } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.textLight,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <Button title="Cerrar Sesión" color={colors.danger} onPress={logout} />
      }}
    >
      {userInfo?.role === 'admin' ? (
        <Stack.Screen name="AdminDashboard" component={UserManagementScreen} options={{ title: 'Panel de Administración' }} />
      ) : (<>
        <Stack.Screen name="MechanicDashboard" component={MechanicDashboardScreen} options={{ title: 'Taller - Servicios' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Órdenes de Servicio' }}/>
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Detalle de la Orden' }} />
        <Stack.Screen name="CreateService" component={CreateServiceScreen} options={{ title: 'Nueva Orden' }} />
      </>)}
    </Stack.Navigator>
  );
}