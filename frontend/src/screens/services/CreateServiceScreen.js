import React, { useEffect, useState } from 'react';
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

import colors from '../../theme/colors';
import { getAllClients } from '../../services/clientService';
import { createService } from '../../services/serviceOrderService';

export default function CreateServiceScreen({ navigation }) {

  const [clients, setClients] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [motorcycleId, setMotorcycleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const [clientModalVisible, setClientModalVisible] = useState(false);

  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  // Cargar clientes desde el backend
  const loadClients = async () => {
    try {
      setLoadingClients(true);

      const data = await getAllClients();

      setClients(data);

    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error ||
        'No se pudieron cargar los clientes'
      );
    } finally {
      setLoadingClients(false);
    }
  };

  // Seleccionar cliente
  const selectClient = (client) => {

    setSelectedClient(client);
    setMotorcycleId('');
    setClientModalVisible(false);
  };

  // Crear orden
  const handleCreateService = async () => {

    if (!selectedClient) {
      Alert.alert(
        'Campo obligatorio',
        'Selecciona un cliente'
      );

      return;
    }

    if (!motorcycleId.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Ingresa el ID de la motocicleta'
      );

      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Ingresa una descripción del servicio'
      );

      return;
    }

    if (!cost.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Ingresa el costo estimado'
      );

      return;
    }

    const numericCost = Number(cost);

    if (Number.isNaN(numericCost) || numericCost < 0) {
      Alert.alert(
        'Costo inválido',
        'Ingresa un costo válido'
      );

      return;
    }

    try {

      setSaving(true);

      await createService({
        motorcycleId: Number(motorcycleId),
        description: description.trim(),
        cost: numericCost
      });

      Alert.alert(
        'Servicio creado',
        'La orden de servicio fue registrada correctamente',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo crear la orden de servicio';

      Alert.alert(
        'Error',
        message
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* Cliente */}

      <Text style={styles.label}>
        Cliente
      </Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setClientModalVisible(true)}
      >
        <Text
          style={
            selectedClient
              ? styles.selectorText
              : styles.placeholder
          }
        >
          {selectedClient
            ? selectedClient.name
            : 'Seleccionar cliente'}
        </Text>

        <Text style={styles.arrow}>
          ▼
        </Text>

      </TouchableOpacity>


      {/* Motocicleta */}

      <Text style={styles.label}>
        Motocicleta
      </Text>

      <TextInput
        style={styles.input}
        value={motorcycleId}
        onChangeText={(value) =>
          setMotorcycleId(value.replace(/\D/g, ''))
        }
        placeholder="Ingresar ID de motocicleta"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
      />

      {selectedClient && (
        <Text style={styles.pendingText}>
          Ingresa el ID de una motocicleta perteneciente a {selectedClient.name}.
        </Text>
      )}


      {/* Descripción */}

      <Text style={styles.label}>
        Descripción del servicio
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Ej. Cambio de aceite y revisión de frenos"
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
        maxLength={500}
      />


      {/* Costo */}

      <Text style={styles.label}>
        Costo estimado
      </Text>

      <TextInput
        style={styles.input}
        value={cost}
        onChangeText={setCost}
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
      />


      {/* Botón Crear */}

      <TouchableOpacity
        style={[
          styles.createButton,
          saving && styles.buttonDisabled
        ]}
        disabled={saving}
        onPress={handleCreateService}
      >

        {saving ? (
          <ActivityIndicator
            color={colors.textDark}
          />
        ) : (
          <Text style={styles.createButtonText}>
            Crear Orden
          </Text>
        )}

      </TouchableOpacity>


      {/* Modal para seleccionar cliente */}

      <Modal
        visible={clientModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setClientModalVisible(false)
        }
      >

        <View style={styles.modalBackground}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Seleccionar cliente
            </Text>

            {loadingClients ? (

              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

            ) : (

              <FlatList
                data={clients}
                keyExtractor={(item) =>
                  item.id.toString()
                }
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No hay clientes registrados
                  </Text>
                }
                renderItem={({ item }) => (

                  <TouchableOpacity
                    style={styles.option}
                    onPress={() =>
                      selectClient(item)
                    }
                  >

                    <Text style={styles.optionTitle}>
                      {item.name}
                    </Text>

                    {item.phone && (
                      <Text style={styles.optionSubtitle}>
                        Teléfono: {item.phone}
                      </Text>
                    )}

                    {item.email && (
                      <Text style={styles.optionSubtitle}>
                        Correo: {item.email}
                      </Text>
                    )}

                  </TouchableOpacity>

                )}
              />

            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setClientModalVisible(false)
              }
            >

              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>

            </TouchableOpacity>

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

  content: {
    padding: 20,
    paddingBottom: 40
  },

  label: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16
  },

  selector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface
  },

  selectorDisabled: {
    opacity: 0.6
  },

  selectorText: {
    color: colors.text,
    flex: 1,
    fontSize: 15
  },

  placeholder: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 15
  },

  arrow: {
    color: colors.textSecondary,
    marginLeft: 10
  },

  pendingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 7
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    color: colors.text,
    backgroundColor: colors.surface
  },

  textArea: {
    minHeight: 110,
    textAlignVertical: 'top'
  },

  createButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30
  },

  createButtonText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 16
  },

  buttonDisabled: {
    opacity: 0.6
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },

  modalContainer: {
    maxHeight: '70%',
    backgroundColor: colors.background,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15
  },

  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },

  optionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16
  },

  optionSubtitle: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 13
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20
  },

  cancelButton: {
    marginTop: 15,
    padding: 14,
    alignItems: 'center'
  },

  cancelButtonText: {
    color: colors.danger,
    fontWeight: 'bold'
  }

});