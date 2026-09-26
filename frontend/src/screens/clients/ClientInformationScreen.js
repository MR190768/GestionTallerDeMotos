import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function ClientInformationScreen({route}) {
    const { clientId } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Informacion del cliente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background 
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500'
  }
});