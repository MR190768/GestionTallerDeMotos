import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import colors from '../../theme/colors';
import { getAllClients, getClientById } from '../../services/clientService';
import {
  createMotorcycle,
  updateMotorcycle,
  getMotorcycleById
} from '../../services/motorcycleService';
import { handleApiError } from '../../utils/errorHandler';

export default function MotorcycleFormScreen({ route, navigation }) {
  const motorcycleId = route.params?.motorcycleId;
  const preselectedClientId = route.params?.preselectedClientId;
  const isEditing = Boolean(motorcycleId);

  // Campos del formulario
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Estados de carga y modal
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientsModalVisible, setClientsModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    const initForm = async () => {
      try {
        setInitialLoading(true);

        // Si es edición, cargar datos de la motocicleta existente
        if (isEditing) {
          const data = await getMotorcycleById(motorcycleId);
          setBrand(data.brand || '');
          setModel(data.model || '');
          setYear(data.year ? String(data.year) : '');
          setLicensePlate(data.licensePlate || '');
          setSelectedClient({
            id: data.clientId,
            name: data.clientName,
            phone: data.clientPhone
          });
        } else if (preselectedClientId) {
          // Si viene preseleccionado desde el perfil del cliente
          const clientData = await getClientById(preselectedClientId);
          setSelectedClient(clientData);
        }
      } catch (error) {
        handleApiError(error, 'Error al Cargar', 'No se pudieron cargar los datos para el formulario.');
      } finally {
        setInitialLoading(false);
      }
    };

    initForm();
  }, [motorcycleId, preselectedClientId]);

  // Cargar lista de clientes para el modal de selección
  const loadClientsList = async () => {
    try {
      setLoadingClients(true);
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      handleApiError(error, 'Error al Cargar Clientes', 'No se pudo obtener el listado de clientes.');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleOpenClientModal = () => {
    setClientsModalVisible(true);
    if (clients.length === 0) {
      loadClientsList();
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!clientSearch.trim()) return true;
    const term = clientSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientsModalVisible(false);
    setClientSearch('');
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      Alert.alert('Campo Obligatorio', 'Debes seleccionar el cliente propietario de la motocicleta.');
      return;
    }

    if (!brand.trim()) {
      Alert.alert('Campo Obligatorio', 'Ingresa la marca de la motocicleta (ej. Honda, Yamaha).');
      return;
    }

    if (!model.trim()) {
      Alert.alert('Campo Obligatorio', 'Ingresa el modelo de la motocicleta (ej. CB190R).');
      return;
    }

    if (!licensePlate.trim()) {
      Alert.alert('Campo Obligatorio', 'Ingresa la placa de la motocicleta.');
      return;
    }

    const payload = {
      clientId: selectedClient.id,
      brand: brand.trim(),
      model: model.trim(),
      year: year.trim() ? parseInt(year.trim(), 10) : null,
      licensePlate: licensePlate.trim().toUpperCase()
    };

    try {
      setSaving(true);

      if (isEditing) {
        await updateMotorcycle(motorcycleId, payload);
        Alert.alert('Éxito', 'Motocicleta actualizada correctamente.');
      } else {
        await createMotorcycle(payload);
        Alert.alert('Éxito', 'Motocicleta registrada correctamente.');
      }

      navigation.goBack();
    } catch (error) {
      handleApiError(
        error,
        isEditing ? 'Error al Actualizar' : 'Error al Registrar',
        'No se pudo guardar la motocicleta. Verifica que la placa no esté duplicada.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando formulario...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        {isEditing ? 'Editar Motocicleta' : 'Registrar Nueva Motocicleta'}
      </Text>
      <Text style={styles.subtitle}>
        {isEditing
          ? 'Actualiza los datos del vehículo y su propietario'
          : 'Ingresa los datos para registrar la motocicleta en el sistema'}
      </Text>

      {/* Selector de Cliente Propietario */}
      <Text style={styles.inputLabel}>Cliente Propietario *</Text>
      <TouchableOpacity
        style={styles.clientSelectorCard}
        onPress={handleOpenClientModal}
        activeOpacity={0.7}
      >
        {selectedClient ? (
          <View style={styles.clientSelectedInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientSelectedName}>👤 {selectedClient.name}</Text>
              <Text style={styles.clientSelectedDetail}>
                {selectedClient.phone ? `Tel: ${selectedClient.phone}` : 'Sin teléfono'} • ID: #{selectedClient.id}
              </Text>
            </View>
            <Text style={styles.changeClientText}>Cambiar</Text>
          </View>
        ) : (
          <View style={styles.clientPlaceholderRow}>
            <Text style={styles.clientPlaceholderText}>Seleccionar cliente del taller...</Text>
            <Text style={styles.clientSearchIcon}>🔍</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Placa */}
      <Text style={styles.inputLabel}>Placa de la Motocicleta *</Text>
      <TextInput
        style={styles.inputPlate}
        placeholder="Ej. M123-456 o M-89012"
        placeholderTextColor={colors.textSecondary}
        value={licensePlate}
        onChangeText={(text) => setLicensePlate(text.toUpperCase())}
        autoCapitalize="characters"
      />

      {/* Marca */}
      <Text style={styles.inputLabel}>Marca *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Honda, Yamaha, Suzuki, Bajaj"
        placeholderTextColor={colors.textSecondary}
        value={brand}
        onChangeText={setBrand}
      />

      {/* Modelo */}
      <Text style={styles.inputLabel}>Modelo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. CB190R, Pulsar NS200, YBR 125"
        placeholderTextColor={colors.textSecondary}
        value={model}
        onChangeText={setModel}
      />

      {/* Año */}
      <Text style={styles.inputLabel}>Año de Fabricación</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 2022"
        placeholderTextColor={colors.textSecondary}
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
        maxLength={4}
      />

      {/* Botón de Guardar */}
      <TouchableOpacity
        style={[styles.btnSubmit, saving && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <Text style={styles.btnSubmitText}>
            {isEditing ? 'Guardar Cambios' : 'Registrar Motocicleta'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Modal para Buscar y Seleccionar Cliente */}
      <Modal
        visible={clientsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setClientsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Propietario</Text>
              <TouchableOpacity
                onPress={() => setClientsModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar cliente por nombre o teléfono..."
              placeholderTextColor={colors.textSecondary}
              value={clientSearch}
              onChangeText={setClientSearch}
            />

            {loadingClients ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalClientItem}
                    onPress={() => handleSelectClient(item)}
                  >
                    <Text style={styles.modalClientName}>{item.name}</Text>
                    <Text style={styles.modalClientSub}>
                      {item.phone || 'Sin teléfono'} • {item.email || 'Sin correo'}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>No se encontraron clientes.</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.background,
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary
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
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text
  },
  inputPlate: {
    backgroundColor: '#F3FAF6',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    letterSpacing: 1
  },
  clientSelectorCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 6
  },
  clientPlaceholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clientPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  clientSearchIcon: {
    fontSize: 16
  },
  clientSelectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  clientSelectedName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text
  },
  clientSelectedDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  changeClientText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 10
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28
  },
  btnDisabled: {
    opacity: 0.6
  },
  btnSubmitText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
    minHeight: '50%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  modalCloseBtn: {
    padding: 6
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary
  },
  modalSearchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12
  },
  modalClientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'
  },
  modalClientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text
  },
  modalClientSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  modalEmpty: {
    padding: 30,
    alignItems: 'center'
  },
  modalEmptyText: {
    color: colors.textSecondary,
    fontSize: 14
  }
});
