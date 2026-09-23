import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function MechanicDashboardScreen({navigation}) {
  const { userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido Mecánico {userInfo?.name}!</Text>
      <Text style={styles.subtitle}>Aquí verás las órdenes de servicio, clientes y motos asignadas.</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Módulos Asignados:</Text>
        <Text style={styles.allowedText}>✓ Acceso Permitido a: Clientes, Motos, Repuestos y Servicios.</Text>
        <Text style={styles.deniedText}>✕ Acceso Bloqueado a: Usuarios y Finanzas.</Text>
      </View>
      
      {/*Boton de prueba modulo servicios */}
    <TouchableOpacity style={styles.serviceButton}onPress={() => navigation.navigate('Services')}>
      <Text style={styles.serviceButtonText}>Ver Órdenes de Servicio</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: colors.background 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    color: colors.text 
  },
  subtitle: { 
    fontSize: 15, 
    color: colors.textSecondary, 
    marginBottom: 20 
  },
  card: { 
    padding: 20, 
    backgroundColor: colors.card, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  cardHeader: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 10 
  },
  allowedText: { 
    color: colors.success, 
    fontSize: 14, 
    marginBottom: 8 
  },
  deniedText: { 
    color: colors.danger, 
    fontSize: 14 
  },

  //estilos de boton de prueba
  serviceButton: {
  backgroundColor: colors.primary,
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 20,
},

serviceButtonText: {
  color: colors.textDark,
  fontSize: 16,
  fontWeight: 'bold',
}
});