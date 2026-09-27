import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getClientById } from '../../services/clientService';
import colors from '../../theme/colors';

export default function ClientInformationScreen({route, navigation}) {
    const { clientId } = route.params;
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadClient = async () => {
    try {
      setLoading(true);

      const data = await getClientById(clientId);

      setClient(data);

    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error ||
          'No se pudo cargar la información del cliente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClient();
    }, [clientId])
  );

  // --- Pantalla de carga por si se tarda mucho ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Cargando información del cliente...
        </Text>
      </View>
    );
  }

  // --- Error si no se encontro el cliente ---

  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          No se encontró la información del cliente.
        </Text>

        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnBackText}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const email = client.email?.trim() || 'N/A';

  const address = client.address?.trim() || 'Desconocida';

  const debt = Number(client.debt) || 0;

  const serviceCount = Number(client.serviceCount) || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >

      <Text style={styles.title}>
        Información del cliente
      </Text>
      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Nombre
        </Text>
        <Text style={styles.value}>
          {client.name}
        </Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Correo electrónico
        </Text>

        <Text style={styles.value}>
          {email}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Teléfono
        </Text>

        <Text style={styles.value}>
          {client.phone || 'N/A'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Dirección
        </Text>

        <Text style={styles.value}>
          {address}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Deuda
        </Text>

        <Text
          style={[
            styles.value,
            debt > 0 && styles.debtValue
          ]}
        >
          {debt > 0
            ? `$${debt.toFixed(2)}`
            : 'No tiene'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>
          Servicios activos
        </Text>

        <Text style={styles.value}>
          {serviceCount}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnBackText}>
          Volver
        </Text>
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
    paddingBottom: 30
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 15
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20
  },

  infoCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },

  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6
  },

  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '500'
  },

  debtValue: {
    color: colors.danger,
    fontWeight: 'bold'
  },

  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },

  btnBack: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },

  btnBackText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 16
  }
});