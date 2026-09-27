import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import colors from '../../theme/colors';

export default function AddClientScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.searchText}>Nombre (Obligatorio):</Text>
      <TextInput
        style={styles.search}
        placeholder="Nombre"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.searchText}>Correo Electronico:</Text>
      <TextInput
        style={styles.search}
        placeholder="Correo"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.searchText}>Telefono (Obligatorio):</Text>
      <TextInput
        style={styles.search}
        placeholder="Telefono de 8 Digitos"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.searchText}>Direccion:</Text>
      <TextInput
        style={styles.search}
        placeholder="Direccion"
        placeholderTextColor={colors.textMuted}
      />
      <TouchableOpacity style={styles.btnCreate}>
        <Text style={styles.btnCreateText}>Agregar Nuevo Cliente</Text>
      </TouchableOpacity>
    </ScrollView>
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
  }
});