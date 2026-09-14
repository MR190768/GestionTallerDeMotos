import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Por favor ingresa correo y contraseña');
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Error de Autenticación', error.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Taller</Text>
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
        <ActivityIndicator size="large" color={colors.primary} />
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
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 24, 
    textAlign: 'center',
    color: colors.text 
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