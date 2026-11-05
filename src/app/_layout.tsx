
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme, View, Text, ActivityIndicator } from 'react-native';

import { inicializarBaseDatos } from '../components/chofer/data/database';

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';

  const [baseLista, setBaseLista] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function prepararBaseDatos() {
      try {
        await inicializarBaseDatos();

        if (activo) {
          setBaseLista(true);
        }
      } catch (e) {
        console.error('Error al inicializar SQLite:', e);

        if (activo) {
          setError('No se pudo inicializar la base de datos local.');
        }
      }
    }

    prepararBaseDatos();

    return () => {
      activo = false;
    };
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: isDark ? '#121212' : '#F5F7FA',
        }}
      >
        <Text
          style={{
            color: isDark ? '#F5F5F5' : '#172033',
            fontSize: 16,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!baseLista) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          backgroundColor: isDark ? '#121212' : '#F5F7FA',
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? '#FFFFFF' : '#2458A6'}
        />
        <Text style={{ color: isDark ? '#F5F5F5' : '#172033' }}>
          Preparando Acachete...
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#F5F7FA',
        },
      }}
    />
  );
}
