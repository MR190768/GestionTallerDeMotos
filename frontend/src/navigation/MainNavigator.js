import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import MechanicDashboardScreen from '../screens/mechanic/MechanicDashboardScreen';
import { Button } from 'react-native';
import colors from '../theme/colors';

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
      ) : (
        <Stack.Screen name="MechanicDashboard" component={MechanicDashboardScreen} options={{ title: 'Taller - Servicios' }} />
      )}
    </Stack.Navigator>
  );
}