
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type ReporteEntrega = {
  cantidad: number;
  fotografiaUri: string;
  comentarios: string;
  estado: 'Entregado' | 'Entrega parcial';
};

type Props = {
  pedidoId: string;
  cantidadRecibida: number;
  onConfirmar: (reporte: ReporteEntrega) => void;
  onCancelar: () => void;
};

export default function PedidoEntregaForm({
  pedidoId,
  cantidadRecibida,
  onConfirmar,
  onCancelar,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [cantidad, setCantidad] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [fotografiaUri, setFotografiaUri] = useState<string | null>(null);
  const [tomandoFoto, setTomandoFoto] = useState(false);

  const colors = {
    text: isDark ? '#f5f5f5' : '#172033',
    secondary: isDark ? '#B0B7C3' : '#657084',
    border: isDark ? '#454545' : '#CDD4DF',
    field: isDark ? '#292929' : '#FFFFFF',
    primary: '#2458A6',
    muted: isDark ? '#333333' : '#E7EEFF',
  };

  const styles = createStyles(colors);

  async function tomarFotografia() {
    try {
      setTomandoFoto(true);

      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el acceso a la cámara para registrar la entrega.'
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.65,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setFotografiaUri(resultado.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo tomar la fotografía.');
    } finally {
      setTomandoFoto(false);
    }
  }

  function confirmar() {
    const textoCantidad = cantidad.trim();
    const numero = Number(textoCantidad);

    if (
      textoCantidad === '' ||
      !Number.isInteger(numero) ||
      numero <= 0
    ) {
      Alert.alert(
        'Cantidad inválida',
        'Ingresa un número entero mayor que cero.'
      );
      return;
    }

    if (numero > cantidadRecibida) {
      Alert.alert(
        'Cantidad superior a la recibida',
        `Este pedido tiene registrados ${cantidadRecibida} bultos recibidos.`
      );
      return;
    }

    if (!fotografiaUri) {
      Alert.alert(
        'Falta la fotografía',
        'Toma una fotografía para registrar la evidencia de entrega.'
      );
      return;
    }

    if (numero < cantidadRecibida && !comentarios.trim()) {
      Alert.alert(
        'Entrega parcial',
        'Explica en los comentarios por qué no se entregaron todos los bultos recibidos.'
      );
      return;
    }

    const estado =
      numero === cantidadRecibida
        ? 'Entregado'
        : 'Entrega parcial';

    Alert.alert(
      'porte',
      estado === 'Entregado'
        ? '¿Confirmas que registraste la entrega de todos los bultos?'
        : '¿Confirmas el registro de una entrega parcial?',
      [
        { text: 'Revisar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            onConfirmar({
              cantidad: numero,
              fotografiaUri,
              comentarios: comentarios.trim(),
              estado,
            });
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte de entrega</Text>
      <Text style={styles.hint}>
        Pedido #{pedidoId} · Recibidos: {cantidadRecibida} bultos
      </Text>

      <Text style={styles.label}>Bultos entregados *</Text>
      <TextInput
        value={cantidad}
        onChangeText={(value) =>
          setCantidad(value.replace(/[^0-9]/g, ''))
        }
        keyboardType="number-pad"
        placeholder="Ej. 2"
        placeholderTextColor={colors.secondary}
        style={styles.input}
      />

      <Text style={styles.label}>Fotografía de la entrega *</Text>
      <Pressable
        onPress={tomarFotografia}
        disabled={tomandoFoto}
        style={styles.photoButton}
      >
        <Text style={styles.photoText}>
          {tomandoFoto
            ? 'Abriendo cámara...'
            : fotografiaUri
              ? '✓ Fotografía registrada · Tomar otra'
              : '▣ Tomar fotografía'}
        </Text>
      </Pressable>

      <Text style={styles.hint}>
        {fotografiaUri
          ? 'Se registró una fotografía en este dispositivo.'
          : 'Registra evidencia del pedido entregado.'}
      </Text>

      <Text style={styles.label}>Comentarios</Text>
      <TextInput
        value={comentarios}
        onChangeText={setComentarios}
        placeholder="Detalles de la entrega o algún suceso..."
        placeholderTextColor={colors.secondary}
        multiline
        textAlignVertical="top"
        style={[styles.input, styles.textArea]}
      />

      <View style={styles.actions}>
        <Pressable onPress={onCancelar} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <Pressable
          onPress={confirmar}
          disabled={tomandoFoto}
          style={[
            styles.confirmButton,
            tomandoFoto && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.confirmText}>Confirmar entrega</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: {
  text: string;
  secondary: string;
  border: string;
  field: string;
  primary: string;
  muted: string;
}) {
  return StyleSheet.create({
    container: {
      paddingTop: 16,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 5,
    },
    hint: {
      color: colors.secondary,
      fontSize: 12,
      lineHeight: 18,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.field,
      color: colors.text,
      fontSize: 15,
    },
    textArea: {
      minHeight: 100,
    },
    photoButton: {
      minHeight: 48,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    cancelButton: {
      minHeight: 48,
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    cancelText: {
      color: colors.text,
      fontWeight: '700',
    },
    confirmButton: {
      minHeight: 48,
      flex: 2,
      borderRadius: 10,
      backgroundColor: '#16834A',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    confirmText: {
      color: '#FFFFFF',
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
