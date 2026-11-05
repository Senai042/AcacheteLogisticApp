
import React, { useEffect,useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import PedidoRecepcionCard from '../components/chofer/bloques/PedidoRecepcionCard';
import { PEDIDOS_DEMO } from '../components/chofer/data/pedidosDemo';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { exportarDatosJSON } from '../components/chofer/data/database';

import {
  guardarPedido,
  guardarRecepcionPedido,
  obtenerPedidos,
  type PedidoLocal,
} from '../components/chofer/data/database';

export default function BloquesScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [abierto, setAbierto] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [recibido, setRecibido] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [tomandoFoto, setTomandoFoto] = useState<string | null>(null);

  const [pedidos, setPedidos] = useState<PedidoLocal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  const colors = {
    background: isDark ? '#121212' : '#F5F7FA',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#F5F5F5' : '#172033',
    secondary: isDark ? '#B0B7C3' : '#657084',
    border: isDark ? '#353535' : '#E0E5ED',
    primary: '#2458A6',
    green: '#16834A',
    disabled: isDark ? '#414141' : '#D9DEE7',
  };

  const styles = createStyles(colors);

  async function tomarFotografia(pedidoId: string) {
    try {
      setTomandoFoto(pedidoId);

      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el acceso a la cámara para registrar la recepción.'
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.65,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
         const uri = resultado.assets[0].uri;

        console.log('Pedido:', pedidoId);
        console.log('URI de la fotografía:', uri);

        setFotos((prev) => ({
          ...prev,
          [pedidoId]: resultado.assets[0].uri,
        }));
      }
    } catch {
      Alert.alert(
        'Error',
        'No fue posible tomar la fotografía. Inténtalo de nuevo.'
      );
    } finally {
      setTomandoFoto(null);
    }
  }

  useEffect(() => {
  async function cargarPedidos() {
        try {
          setCargando(true);
          setErrorCarga(false);

          let guardados = await obtenerPedidos();

          // Los pedidos de demostración se insertan
          // únicamente cuando la base local está vacía.
          if (guardados.length === 0) {
            for (const pedido of PEDIDOS_DEMO) {
              await guardarPedido(pedido);
            }

            guardados = await obtenerPedidos();
          }

          setPedidos(guardados);

          setCantidades(
            Object.fromEntries(
              guardados
                .filter((p) => p.cantidad_recibida != null)
                .map((p) => [
                  p.id,
                  String(p.cantidad_recibida),
                ])
            )
          );

          setFotos(
            Object.fromEntries(
              guardados
                .filter((p) => p.fotografia_recepcion_uri)
                .map((p) => [
                  p.id,
                  p.fotografia_recepcion_uri!,
                ])
            )
          );

          setRecibido(
            guardados.length > 0 &&
              guardados.every(
                (p) =>
                  p.cantidad_recibida != null &&
                  Boolean(p.fotografia_recepcion_uri)
              )
          );
        } catch (error) {
          console.error('Error cargando pedidos locales:', error);
          setErrorCarga(true);
        } finally {
          setCargando(false);
        }
      }

      cargarPedidos();
    }, []);



  
    async function confirmarRecepcion() {
      const incompletos = pedidos.filter((pedido) => {
      const cantidad = cantidades[pedido.id]?.trim();
      const numero = Number(cantidad);

        return (
          cantidad === undefined ||
          cantidad === '' ||
          !Number.isInteger(numero) ||
          numero < 0 ||
          !fotos[pedido.id]
        );
      });

      if (incompletos.length > 0) {
        Alert.alert(
          'Recepción incompleta',
          `Completa la cantidad recibida y toma una fotografía de cada pedido. Faltan ${incompletos.length} pedido(s).`
        );
        return;
      }

      Alert.alert(
        'Confirmar recepción',
        '¿Confirmas que revisaste y recibiste los pedidos registrados?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                for (const pedido of pedidos) {
                  await guardarRecepcionPedido(
                    pedido.id,
                    Number(cantidades[pedido.id]),
                    fotos[pedido.id]
                  );
                }

                const actualizados = await obtenerPedidos();
                setPedidos(actualizados);
                setRecibido(true);

                Alert.alert(
                  'Recepción guardada',
                  'La recepción se guardó en el dispositivo. Quedó pendiente de sincronización con el servidor.'
                );
              } catch (error) {
                console.error(
                  'Error guardando recepción:',
                  error
                );

                Alert.alert(
                  'No se pudo completar',
                  'Hubo un problema guardando la recepción. Revisa los datos e inténtalo de nuevo.'
                );
              }
            },
          },
        ]
      );
    }


  async function exportarJSON() {
  try {
    const json = await exportarDatosJSON();

    if (!FileSystem.documentDirectory) {
      Alert.alert(
        'No disponible',
        'No se encontró una carpeta para guardar el archivo.'
      );
      return;
    }

    const nombreArchivo =
      `acachete_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

    const ruta = `${FileSystem.documentDirectory}${nombreArchivo}`;

    await FileSystem.writeAsStringAsync(ruta, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const disponible = await Sharing.isAvailableAsync();

    if (!disponible) {
      Alert.alert(
        'Archivo creado',
        `El JSON se guardó en el dispositivo, pero no se puede abrir el menú para compartirlo.\n\n${ruta}`
      );
      return;
    }

    await Sharing.shareAsync(ruta, {
      mimeType: 'application/json',
      dialogTitle: 'Exportar datos de Acachete',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Error exportando JSON:', error);

    Alert.alert(
      'Error de exportación',
      'No se pudo crear el archivo JSON. Revisa la consola para más detalles.'
    );
  }
}



  function abrirBloque() {
    setAbierto(true);
  }

  function volver() {
    if (abierto) {
      setAbierto(false);
      setExpandido(null);
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Pressable onPress={volver}>
          <Text style={styles.backText}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {abierto ? 'Bloque #001' : 'Mis bloques'}
        </Text>
        <View style={{ width: 55 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
          {cargando ? (
            <Text style={styles.subtitle}>
              Cargando pedidos guardados...
            </Text>
          ) : errorCarga ? (
            <Text style={styles.subtitle}>
              No se pudieron cargar los pedidos locales.
              Volvé a intentarlo recargando la aplicación.
            </Text>
          ) : !abierto ? (
          <>
            <Text style={styles.heading}>Mis bloques</Text>
            <Text style={styles.subtitle}>
              Consulta tus pedidos y registra la recepción de mercancía.
            </Text>

            <Pressable
              onPress={abrirBloque}
              style={styles.blockCard}
            >
              <View style={styles.blockTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockTitle}>Bloque #001</Text>
                  <Text style={styles.subtitle}>
                    Unidad AC-04 · Máximo 5 pedidos
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: recibido
                        ? '#DDF5E5'
                        : '#FFF0D5',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: recibido ? '#17683A' : '#8A5700',
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {recibido ? 'Recibido' : 'Pendiente'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.blockCount}>
                {pedidos.length} pedidos
              </Text>

              <Text style={styles.blockLink}>
                Abrir bloque →
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.blockTitle}>Bloque #001</Text>
              <Text style={styles.subtitle}>
                {pedidos.length} de 5 espacios utilizados
              </Text>

              <View
                style={[
                  styles.status,
                  {
                    backgroundColor: recibido
                      ? '#DDF5E5'
                      : isDark
                        ? '#352B1B'
                        : '#FFF4DF',
                  },
                ]}
              >
                <Text
                  style={{
                    color: recibido ? '#17683A' : colors.text,
                    fontWeight: '600',
                  }}
                >
                  {recibido
                    ? '✓ Recepción completada'
                    : 'Pendiente de recepción'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Pedidos del bloque
            </Text>

            {pedidos.slice(0, 5).map((pedido) => (
              <PedidoRecepcionCard
                key={pedido.id}
                pedido={pedido}
                expanded={expandido === pedido.id}
                cantidad={cantidades[pedido.id] ?? ''}
                fotoCapturada={Boolean(fotos[pedido.id])}
                bloqueRecibido={recibido}
                cantidadRecibida={Number(cantidades[pedido.id] ?? '0')}
                onToggle={() =>
                  setExpandido((actual) =>
                    actual === pedido.id ? null : pedido.id
                  )
                }
                onChangeCantidad={(value) =>
                  setCantidades((prev) => ({
                    ...prev,
                    [pedido.id]: value.replace(/[^0-9]/g, ''),
                  }))
                }
                onTomarFoto={() => tomarFotografia(pedido.id)}
                
              />
            ))}

            {!recibido && (
              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>
                  Confirmar recepción
                </Text>
                <Text style={styles.subtitle}>
                  Registra la cantidad recibida y una fotografía por
                  cada pedido. No se mostrarán cantidades esperadas.
                </Text>

                <Pressable
                  onPress={confirmarRecepcion}
                  disabled={tomandoFoto !== null}
                  style={[
                    styles.confirmButton,
                    tomandoFoto !== null && {
                      backgroundColor: colors.disabled,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      tomandoFoto !== null && {
                        color: colors.secondary,
                      },
                    ]}
                  >
                    {tomandoFoto
                      ? 'Procesando fotografía...'
                      : 'Confirmar recepción del bloque'}
                  </Text>
                </Pressable>
              </View>
            )}

            {recibido && (
              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>
                  Bloque habilitado
                </Text>
                <Text style={styles.subtitle}>
                  Ya puedes abrir cada pedido y continuar con su
                  gestión de entrega.
                </Text>
              </View>
            )}
  
            <Pressable
              onPress={exportarJSON}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>
                Exportar datos a JSON
              </Text>
            </Pressable>

            <Text style={styles.note}>
              Prototipo local: las fotografías no se suben a un servidor
              y los datos no constituyen un registro operativo.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: {
  background: string;
  card: string;
  text: string;
  secondary: string;
  border: string;
  primary: string;
  green: string;
  disabled: string;
}) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      minHeight: 58,
      paddingHorizontal: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    content: {
      padding: 18,
      paddingBottom: 40,
      gap: 14,
    },
    heading: {
      fontSize: 27,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.secondary,
      marginTop: 4,
    },
    blockCard: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    blockTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    blockTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: '700',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    blockCount: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
    },
    blockLink: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '700',
    },
    summaryCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    status: {
      padding: 11,
      borderRadius: 10,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    confirmButton: {
      minHeight: 50,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    confirmText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center',
    },
    note: {
      color: colors.secondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
