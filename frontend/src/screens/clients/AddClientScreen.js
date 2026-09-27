import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import {createClient, getClientById, updateClient} from '../../services/clientService';
import colors from '../../theme/colors';

export default function AddClientScreen({navigation, route}) {

  const clientId = route.params?.clientId;
  const isEditing = clientId !== undefined && clientId !== null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(isEditing);


  useFocusEffect(
    useCallback(() => {

      if (!isEditing) {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setLoadingClient(false);
        return;
      }

      let isActive = true;

      const loadClient = async () => {
        try {
          setLoadingClient(true);

          const data = await getClientById(clientId);

          if (isActive) {
            setName(data.name || '');
            setEmail(data.email || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
          }

        } catch (error) {
          if (isActive) {
            Alert.alert(
              'Error',
              error.response?.data?.error ||
                'No se pudo cargar la información del cliente.'
            );
          }

        } finally {
          if (isActive) {
            setLoadingClient(false);
          }
        }
      };

      loadClient();

      return () => {
        isActive = false;
      };

    }, [clientId])
  );

  // -- Crear o actualizar cliente --
  const handleSaveClient = async () => {

    //  -- Validar nombre --
    if (!name.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Por favor, ingresa el nombre del cliente.'
      );
      return;
    }

    // -- Validar teléfono --
    if (!/^\d{8}$/.test(phone)) {
      Alert.alert(
        'Teléfono inválido',
        'El teléfono debe contener exactamente 8 dígitos numéricos.'
      );
      return;
    }

    //  -- Validacion de correo --
    const emailTrimmed = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailTrimmed !== '' && !emailRegex.test(emailTrimmed)) {
      Alert.alert(
        'Correo inválido',
        'Por favor, ingresa un correo electrónico válido.'
      );
      return;
    }
    const clientData = {
      name: name.trim(),
      email: emailTrimmed === '' ? null : emailTrimmed,
      phone: phone,
      address: address.trim() === ''
        ? 'Desconocida'
        : address.trim()
    };

    try {
      setLoading(true);

      if (isEditing) {

        await updateClient(clientId, clientData);

        Alert.alert(
          'Cliente actualizado',
          'Los datos del cliente se actualizaron correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack()
            }
          ]
        );

      } else {

        await createClient(clientData);

        Alert.alert(
          'Cliente agregado',
          'El cliente se ha registrado correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }

    } catch (error) {

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo guardar el cliente. Inténtalo nuevamente.';

      Alert.alert(
        isEditing ? 'Error al actualizar' : 'Error al crear cliente',
        message
      );

    } finally {
      setLoading(false);
    }
  };

    // -- Pantalla de carga por si tarda mucho --
  if (loadingClient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Cargando datos del cliente...
        </Text>
      </View>
    );
  }


  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.searchText}>Nombre (Obligatorio):</Text>
      <TextInput
        style={styles.search}
        placeholder="Nombre"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize='words'
        maxLength={100}
      />
      <Text style={styles.searchText}>Correo Electronico (Opcional):</Text>
      <TextInput
        style={styles.search}
        placeholder="Correo"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={150}
      />
      <Text style={styles.searchText}>Telefono (Obligatorio):</Text>
      <TextInput
        style={styles.search}
        placeholder="Telefono de 8 Digitos"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={(value) => {
            setPhone(value.replace(/\D/g, '').slice(0, 8));
        }}
        keyboardType="number-pad"
        maxLength={8}
      />
      <Text style={styles.searchText}>Direccion (Opcional):</Text>
      <TextInput
        style={styles.search}
        placeholder="Direccion"
        placeholderTextColor={colors.textMuted}
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        maxLength={255}
      />
      <TouchableOpacity
          style={[
            styles.btnCreate,
            loading && styles.btnDisabled
          ]}
          onPress={handleSaveClient}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <Text style={styles.btnCreateText}>
              {isEditing
                ? 'Guardar cambios'
                : 'Agregar Nuevo Cliente'}
            </Text>
          )}
        </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    padding: 20
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500'
  },
  search:{
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.border,
    marginBottom:15,
    marginTop:5
  },
  searchText:{
    fontWeight: 'bold', 
    fontSize: 16,
    color: colors.text,
    marginLeft: 5
  },
  btnCreate: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  btnCreateText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: 15
  },
  btnDisabled:{
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    opacity: 0.6
  }
});