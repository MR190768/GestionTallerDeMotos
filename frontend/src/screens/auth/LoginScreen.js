import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { handleApiError } from '../../utils/errorHandler';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Campos requeridos', 'Por favor ingresa tu correo electrónico y contraseña.');
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      handleApiError(error, 'Error de Inicio de Sesión', 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Taller</Text>
      <Text style={styles.subtitle}>Inicia sesión con tu cuenta de usuario</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Correo Electrónico" 
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword} 
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24, 
    backgroundColor: colors.background 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    textAlign: 'center',
    color: colors.text 
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 26
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: 14, 
    marginBottom: 16, 
    borderRadius: 8, 
    backgroundColor: colors.inputBackground,
    color: colors.text,
    fontSize: 16
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: 'bold'
  }
});