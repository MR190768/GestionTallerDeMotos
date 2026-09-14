import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
        style={styles.input} placeholder="Correo Electrónico" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} placeholder="Contraseña" value={password}
        onChangeText={setPassword} secureTextEntry
      />
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : <Button title="Iniciar Sesión" onPress={handleLogin} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5, backgroundColor: colors.white }
});