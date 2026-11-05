
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ChoferScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#F5F7FA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#17202A',
    secondary: isDark ? '#B0B0B0' : '#657080',
    border: isDark ? '#404040' : '#DDE3EA',
    primary: '#1976D2',
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Bienvenido!</Text>
            <Text style={styles.title}>Panel del chofer</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CH</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Acachete Encomiendas
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Tu jornada</Text>
          <Text style={styles.summaryText}>
            Aquí podrás consultar y gestionar tus entregas.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
          </View>
          <Text style={styles.note}>
            Los datos aparecerán cuando conectemos el sistema.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Mis operaciones</Text>

        <Pressable
          style={styles.actionCard}
          onPress={() => router.push('/bloques')}
          >
          <Text style={styles.actionIcon}>📦</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Mis entregas</Text>
            <Text style={styles.actionDescription}>
              Consultar los paquetes asignados.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => alert('Próximamente: información de tu ruta.')}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Mi ruta</Text>
            <Text style={styles.actionDescription}>
              Consultar las paradas de tu recorrido.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => alert('Próximamente: registro de incidencias.')}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Incidencias</Text>
            <Text style={styles.actionDescription}>
              Reportar problemas durante una entrega.
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: {
  background: string;
  surface: string;
  text: string;
  secondary: string;
  border: string;
  primary: string;
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      paddingTop: 55,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      color: colors.secondary,
      fontSize: 15,
    },
    title: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '700',
      marginTop: 5,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.secondary,
      fontSize: 14,
      marginTop: 8,
      marginBottom: 26,
    },
    summary: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 28,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    summaryText: {
      color: colors.secondary,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
    },
    statsRow: {
      flexDirection: 'row',
      marginTop: 22,
      gap: 12,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 14,
      borderRadius: 12,
    },
    statNumber: {
      color: colors.primary,
      fontSize: 25,
      fontWeight: '700',
    },
    statLabel: {
      color: colors.secondary,
      fontSize: 12,
      marginTop: 4,
    },
    note: {
      color: colors.secondary,
      fontSize: 11,
      marginTop: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: '700',
      marginBottom: 14,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    actionIcon: {
      fontSize: 26,
      marginRight: 14,
    },
    actionInfo: {
      flex: 1,
    },
    actionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    actionDescription: {
      color: colors.secondary,
      fontSize: 12,
      marginTop: 5,
    },
    arrow: {
      color: colors.secondary,
      fontSize: 28,
      marginLeft: 8,
    },
    logoutButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 18,
    },
    logoutText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
  });
}
