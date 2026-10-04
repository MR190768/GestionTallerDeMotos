import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../../theme/colors';
import { getAllClients } from '../../services/clientService';
import { getMotorcyclesByClient } from '../../services/motorcycleService';
import { createService } from '../../services/serviceOrderService';
import { handleApiError, getErrorMessage } from '../../utils/errorHandler';
import {
  UserIcon,
  MotorcycleIcon,
  ChevronDownIcon,
  CheckIcon,
  PlusIcon,
  WrenchIcon,
  CloseIcon,
  SearchIcon
} from '../../components/common/AppIcons';

export default function CreateServiceScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const preselectedClientId = route?.params?.preselectedClientId;
  const preselectedMotorcycleId = route?.params?.preselectedMotorcycleId;

  // Clientes
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientModalVisible, setClientModalVisible] = useState(false);

  // Motocicletas del cliente
  const [clientMotorcycles, setClientMotorcycles] = useState([]);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);
  const [loadingMotos, setLoadingMotos] = useState(false);
  const [errorMotos, setErrorMotos] = useState('');

  // Datos del servicio
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar lista general de clientes al iniciar
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const data = await getAllClients();
      setClients(data);

      if (preselectedClientId && !selectedClient) {
        const found = data.find((c) => c.id === preselectedClientId);
        if (found) {
          setSelectedClient(found);
        }
      }
    } catch (error) {
      handleApiError(error, 'Error al Cargar Clientes', 'No se pudieron cargar los clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  // Cargar motocicletas cuando cambie el cliente seleccionado
  const fetchMotorcyclesForClient = useCallback(async (clientId) => {
    if (!clientId) {
      setClientMotorcycles([]);
      setSelectedMotorcycle(null);
      return;
    }

    try {
      setLoadingMotos(true);
      setErrorMotos('');
      const motos = await getMotorcyclesByClient(clientId);
      setClientMotorcycles(motos);

      // Si viene preseleccionada una moto, encontrarla y seleccionarla
      if (preselectedMotorcycleId) {
        const preselected = motos.find((m) => m.id === Number(preselectedMotorcycleId));
        if (preselected) {
          setSelectedMotorcycle(preselected);
          return;
        }
      }

      // Si solo tiene una motocicleta, auto-seleccionarla para agilizar
      if (motos.length === 1) {
        setSelectedMotorcycle(motos[0]);
      } else {
        setSelectedMotorcycle(null);
      }
    } catch (error) {
      setErrorMotos(getErrorMessage(error, 'No se pudieron cargar las motocicletas de este cliente.'));
      setClientMotorcycles([]);
      setSelectedMotorcycle(null);
    } finally {
      setLoadingMotos(false);
    }
  }, [preselectedMotorcycleId]);

  useEffect(() => {
    if (selectedClient?.id) {
      fetchMotorcyclesForClient(selectedClient.id);
    } else {
      setClientMotorcycles([]);
      setSelectedMotorcycle(null);
    }
  }, [selectedClient, fetchMotorcyclesForClient]);

  // Manejar selección de cliente
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientModalVisible(false);
    setClientSearch('');
  };

  // Manejar selección de motocicleta
  const handleSelectMotorcycle = (moto) => {
    setSelectedMotorcycle(moto);
  };

  // Crear orden de servicio con validaciones robustas
  const handleCreateService = async () => {
    if (!selectedClient) {
      Alert.alert('Campo Requerido', 'Por favor selecciona un cliente para la orden de servicio.');
      return;
    }

    if (!selectedMotorcycle) {
      Alert.alert(
        'Motocicleta Requerida',
        'Debes seleccionar la motocicleta del cliente que ingresará a servicio.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa una descripción del trabajo o diagnóstico a realizar.');
      return;
    }

    if (!cost.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa el costo estimado de mano de obra para el servicio.');
      return;
    }

    const numericCost = Number(cost);
    if (Number.isNaN(numericCost) || numericCost < 0) {
      Alert.alert('Costo Inválido', 'Ingresa un valor numérico válido mayor o igual a 0.');
      return;
    }

    try {
      setSaving(true);

      await createService({
        motorcycleId: selectedMotorcycle.id,
        description: description.trim(),
        cost: numericCost
      });

      Alert.alert(
        'Servicio Registrado',
        `La orden de servicio para la motocicleta ${selectedMotorcycle.brand} ${selectedMotorcycle.model} (${selectedMotorcycle.licensePlate}) fue creada correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      handleApiError(error, 'Error al Crear Orden', 'No se pudo registrar la orden de servicio');
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = clientSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 30 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecera Informativa */}
        <View style={styles.headerBox}>
          <WrenchIcon size={24} color={colors.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.screenTitle}>Nueva Orden de Servicio</Text>
            <Text style={styles.screenSubtitle}>
              Asocia el cliente, su vehículo y detalla la labor mecánica a realizar.
            </Text>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* SECCIÓN 1: CLIENTE Y VEHÍCULO                                        */}
        {/* ==================================================================== */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeaderTitle}>1. Propietario y Motocicleta</Text>

          {/* Selector de Cliente */}
          <Text style={styles.fieldLabel}>Cliente Propietario *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setClientModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.selectorLeft}>
              <UserIcon size={18} color={selectedClient ? colors.text : colors.textMuted} />
              <Text
                style={[
                  styles.selectorText,
                  !selectedClient && styles.placeholderText
                ]}
                numberOfLines={1}
              >
                {selectedClient ? selectedClient.name : 'Seleccionar cliente del taller...'}
              </Text>
            </View>
            <ChevronDownIcon size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Información complementaria del cliente si está seleccionado */}
          {selectedClient && (
            <View style={styles.clientBadgeInfo}>
              <Text style={styles.clientSubDetail}>
                Tel: {selectedClient.phone || 'Sin teléfono'} • Correo: {selectedClient.email || 'Sin correo'}
              </Text>
            </View>
          )}

          {/* Selector Dinámico de Motocicletas */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Motocicleta a Intervenir *</Text>

          {!selectedClient ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                Primero selecciona un cliente para listar automáticamente sus motocicletas registradas.
              </Text>
            </View>
          ) : loadingMotos ? (
            <View style={styles.loadingMotosBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMotosText}>Consultando motocicletas del cliente...</Text>
            </View>
          ) : errorMotos ? (
            <View style={styles.errorMotosBox}>
              <Text style={styles.errorMotosText}>{errorMotos}</Text>
              <TouchableOpacity
                style={styles.btnRetryMotos}
                onPress={() => fetchMotorcyclesForClient(selectedClient.id)}
              >
                <Text style={styles.btnRetryMotosText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : clientMotorcycles.length === 0 ? (
            <View style={styles.noMotosCard}>
              <MotorcycleIcon size={32} color={colors.textMuted} />
              <Text style={styles.noMotosTitle}>Este cliente no tiene motocicletas</Text>
              <Text style={styles.noMotosSub}>
                Registra la primera motocicleta para {selectedClient.name} antes de abrir una orden.
              </Text>
              <TouchableOpacity
                style={styles.btnAddMotoQuick}
                onPress={() =>
                  navigation.navigate('MotorcycleForm', { preselectedClientId: selectedClient.id })
                }
              >
                <PlusIcon size={16} color={colors.textDark} />
                <Text style={styles.btnAddMotoQuickText}>Registrar Motocicleta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.motorcyclesContainer}>
              <Text style={styles.motosAvailableCount}>
                Selecciona una de las {clientMotorcycles.length} motocicletas registradas:
              </Text>
              {clientMotorcycles.map((moto) => {
                const isSelected = selectedMotorcycle?.id === moto.id;
                return (
                  <TouchableOpacity
                    key={String(moto.id)}
                    style={[
                      styles.motoChoiceCard,
                      isSelected && styles.motoChoiceCardSelected
                    ]}
                    onPress={() => handleSelectMotorcycle(moto)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.motoChoiceLeft}>
                      <View style={[styles.platePill, isSelected && styles.platePillSelected]}>
                        <Text style={[styles.plateText, isSelected && styles.plateTextSelected]}>
                          {moto.licensePlate}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.motoChoiceTitle}>
                          {moto.brand} {moto.model}
                        </Text>
                        <Text style={styles.motoChoiceYear}>
                          {moto.year ? `Año ${moto.year}` : 'Año no especificado'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                      {isSelected ? <CheckIcon size={14} color={colors.textDark} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ==================================================================== */}
        {/* SECCIÓN 2: DETALLE DEL TRABAJO Y COSTOS                              */}
        {/* ==================================================================== */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeaderTitle}>2. Labor y Presupuesto</Text>

          <Text style={styles.fieldLabel}>Descripción del Trabajo / Diagnóstico *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej. Mantenimiento general, cambio de aceite y filtro, ajuste de frenos y cadena."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Costo Estimado de Mano de Obra ($) *</Text>
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
          <Text style={styles.costNote}>
            Nota: Podrás añadir repuestos de inventario posteriormente desde el detalle del servicio.
          </Text>
        </View>

        {/* Botón de Creación */}
        <TouchableOpacity
          style={[styles.btnSubmit, saving && styles.btnDisabled]}
          onPress={handleCreateService}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <View style={styles.btnSubmitContent}>
              <PlusIcon size={18} color={colors.textDark} />
              <Text style={styles.btnSubmitText}>Crear Orden de Servicio</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para Buscar y Seleccionar Cliente */}
      <Modal
        visible={clientModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setClientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <TouchableOpacity
                onPress={() => setClientModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Barra de búsqueda interna */}
            <View style={styles.modalSearchRow}>
              <SearchIcon size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar por nombre, teléfono o correo..."
                placeholderTextColor={colors.textMuted}
                value={clientSearch}
                onChangeText={setClientSearch}
                autoCapitalize="none"
              />
            </View>

            {loadingClients ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={
                  <View style={styles.emptyClientsBox}>
                    <Text style={styles.emptyClientsText}>
                      No se encontraron clientes que coincidan con la búsqueda.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.clientOption}
                    onPress={() => handleSelectClient(item)}
                  >
                    <View style={styles.clientAvatar}>
                      <UserIcon size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientOptionName}>{item.name}</Text>
                      <Text style={styles.clientOptionSub}>
                        {item.phone ? `Tel: ${item.phone}` : 'Sin teléfono'} • {item.email || 'Sin correo'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3FAF6',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  screenSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  cardSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8
  },
  selectorText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500'
  },
  placeholderText: {
    color: colors.textMuted
  },
  clientBadgeInfo: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 6
  },
  clientSubDetail: {
    fontSize: 12,
    color: colors.textSecondary
  },
  hintBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic'
  },
  loadingMotosBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    justifyContent: 'center'
  },
  loadingMotosText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  errorMotosBox: {
    padding: 14,
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    alignItems: 'center'
  },
  errorMotosText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 8
  },
  btnRetryMotos: {
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  btnRetryMotosText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold'
  },
  noMotosCard: {
    padding: 18,
    backgroundColor: '#FAFBFB',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center'
  },
  noMotosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8
  },
  noMotosSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12
  },
  btnAddMotoQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  btnAddMotoQuickText: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: 'bold'
  },
  motorcyclesContainer: {
    gap: 8
  },
  motosAvailableCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4
  },
  motoChoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  motoChoiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F3FAF6'
  },
  motoChoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  platePill: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  platePillSelected: {
    backgroundColor: colors.primary
  },
  plateText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5
  },
  plateTextSelected: {
    color: colors.textDark
  },
  motoChoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  motoChoiceYear: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  costNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic'
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4
  },
  btnSubmitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  btnSubmitText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: 'bold'
  },
  btnDisabled: {
    opacity: 0.6
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  modalContainer: {
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text
  },
  modalCloseBtn: {
    padding: 4
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 14,
    color: colors.text
  },
  emptyClientsBox: {
    padding: 24,
    alignItems: 'center'
  },
  emptyClientsText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center'
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3FAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  clientOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  clientOptionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});