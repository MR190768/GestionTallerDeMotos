import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import colors from '../../theme/colors';
import { createService } from '../../services/serviceOrderService';

export default function CreateServiceScreen({ navigation }) {
  const [motorcycleId, setMotorcycleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!motorcycleId.trim()) {
      Alert.alert('Aviso', 'Ingrese la motocicleta');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Aviso', 'Ingrese la descripción del servicio');
      return;
    }

    if (!cost || Number(cost) < 0) {
      Alert.alert('Aviso', 'Ingrese un costo válido');
      return;
    }

    try {
      setSaving(true);

      await createService({
        motorcycleId: Number(motorcycleId),
        description: description.trim(),
        cost: Number(cost),
      });

      Alert.alert(
        'Éxito',
        'Orden de servicio creada correctamente'
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo crear la orden'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Nueva Orden de Servicio
      </Text>

      <Text style={styles.label}>
        ID de motocicleta
      </Text>

      <TextInput
        style={styles.input}
        value={motorcycleId}
        onChangeText={setMotorcycleId}
        keyboardType="numeric"
        placeholder="Ej. 1"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>
        Descripción
      </Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Trabajo a realizar"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Text style={styles.label}>
        Costo estimado
      </Text>

      <TextInput
        style={styles.input}
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Guardando...' : 'Crear Orden'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },

  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});