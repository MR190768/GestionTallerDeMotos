import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function MechanicDashboardScreen() {
  const { userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido Mecánico {userInfo?.name}!</Text>
      <Text style={styles.subtitle}>Aquí verás las órdenes de servicio, clientes y motos asignadas.</Text>
      
      <View style={styles.card}>
        <Text>Acceso Permitido a: Clientes, Motos, Repuestos y Servicios.</Text>
        <Text style={{color: 'red', marginTop: 10}}>Acceso Bloqueado a: Usuarios y Finanzas.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: colors.secondary, marginBottom: 20 },
  card: { padding: 20, backgroundColor: colors.white, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }
});