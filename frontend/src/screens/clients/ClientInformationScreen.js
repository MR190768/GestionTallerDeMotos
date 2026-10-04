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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getClientById } from '../../services/clientService';
import { getMotorcyclesByClient } from '../../services/motorcycleService';
import { handleApiError } from '../../utils/errorHandler';
import colors from '../../theme/colors';
import {
  MotorcycleIcon,
  PlusIcon,
  ChevronRightIcon
} from '../../components/common/AppIcons';

export default function ClientInformationScreen({route, navigation}) {
    const insets = useSafeAreaInsets();
    const { clientId } = route.params;
    const [client, setClient] = useState(null);
    const [motorcycles, setMotorcycles] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadClientData = async () => {
    try {
      setLoading(true);

      const [clientData, motosData] = await Promise.all([
        getClientById(clientId),
        getMotorcyclesByClient(clientId)
      ]);

      setClient(clientData);
      setMotorcycles(motosData || []);

    } catch (error) {
      handleApiError(error, 'Error al Cargar Cliente', 'No se pudo cargar la información del cliente.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClientData();
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
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 16) + 32 }
      ]}
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

      {/* Sección de Motocicletas del Cliente */}
      <View style={styles.motosHeaderRow}>
        <View style={styles.motosTitleRow}>
          <MotorcycleIcon size={18} color={colors.text} />
          <Text style={styles.sectionHeaderTitle}>
            Motocicletas ({motorcycles.length})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btnAddMotoSmall}
          onPress={() => navigation.navigate('MotorcycleForm', { preselectedClientId: client.id })}
        >
          <PlusIcon size={13} color={colors.textDark} />
          <Text style={styles.btnAddMotoSmallText}>Registrar Moto</Text>
        </TouchableOpacity>
      </View>

      {motorcycles.length > 0 ? (
        motorcycles.map((moto) => (
          <TouchableOpacity
            key={String(moto.id)}
            style={styles.motoCard}
            onPress={() => navigation.navigate('MotorcycleDetail', { motorcycleId: moto.id })}
            activeOpacity={0.7}
          >
            <View style={styles.motoCardHeader}>
              <View style={styles.motoPlateBadge}>
                <Text style={styles.motoPlateText}>{moto.licensePlate}</Text>
              </View>
              <Text style={styles.motoTitle}>
                {moto.brand} {moto.model}
              </Text>
            </View>
            <View style={styles.motoCardFooter}>
              <Text style={styles.motoYearText}>
                {moto.year ? `Año ${moto.year}` : 'Año no especificado'}
              </Text>
              <View style={styles.linkRow}>
                <Text style={styles.motoLinkText}>Ver Detalle</Text>
                <ChevronRightIcon size={13} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyMotosCard}>
          <Text style={styles.emptyMotosText}>
            Este cliente no tiene motocicletas registradas.
          </Text>
          <TouchableOpacity
            style={styles.btnEmptyAddMoto}
            onPress={() => navigation.navigate('MotorcycleForm', { preselectedClientId: client.id })}
          >
            <Text style={styles.btnEmptyAddMotoText}>Registrar primera motocicleta</Text>
          </TouchableOpacity>
        </View>
      )}

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

  motosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10
  },

  motosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },

  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },

  btnAddMotoSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },

  btnAddMotoSmallText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'bold'
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },

  motoCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10
  },

  motoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },

  motoPlateBadge: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8
  },

  motoPlateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textDark
  },

  motoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1
  },

  motoCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  motoYearText: {
    fontSize: 12,
    color: colors.textSecondary
  },

  motoLinkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold'
  },

  emptyMotosCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12
  },

  emptyMotosText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10
  },

  btnEmptyAddMoto: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },

  btnEmptyAddMotoText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 12
  },

  btnBack: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14
  },

  btnBackText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 15
  }
});