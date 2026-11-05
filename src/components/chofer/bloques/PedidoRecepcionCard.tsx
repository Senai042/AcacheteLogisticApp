
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { PedidoDemo } from '../data/pedidosDemo';
import PedidoEntregaForm, {
  type ReporteEntrega,
} from './PedidoEntregaForm';

type Props = {
  pedido: PedidoDemo;
  expanded: boolean;
  cantidad: string;
  fotoCapturada: boolean;
  bloqueRecibido: boolean;
  cantidadRecibida: number;
  onToggle: () => void;
  onChangeCantidad: (value: string) => void;
  onTomarFoto: () => void;
  
};

export default function PedidoRecepcionCard({
  pedido,
  expanded,
  cantidad,
  fotoCapturada,
  bloqueRecibido,
  cantidadRecibida,
  onToggle,
  onChangeCantidad,
  onTomarFoto,
}: Props) {
  const [gestionandoEntrega, setGestionandoEntrega] = useState(false);
  const [reporteEntrega, setReporteEntrega] =
  useState<ReporteEntrega | null>(null);
  
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.cliente}>
            {pedido.cliente}
          </Text>

          <Text style={styles.id}>
            Pedido #{pedido.id}
          </Text>

          <Text style={styles.status}>
            {reporteEntrega
              ? reporteEntrega.estado
              : bloqueRecibido
                ? 'Recepción completada'
                : 'Pendiente de recepción'}
          </Text>
        </View>

        <Text style={styles.chevron}>
          {expanded ? '−' : '+'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          
            <Text style={styles.label}>Dirección</Text>

            <Text style={styles.value}>
              {pedido.direccion}
            </Text>

            <Pressable
              onPress={() => {
                const direccion = encodeURIComponent(
                  `${pedido.direccion}, Costa Rica`
                );

                const url =
                  `https://www.google.com/maps/search/?api=1&query=${direccion}`;

                import('react-native').then(({ Linking }) =>
                  Linking.openURL(url)
                );
              }}
              style={styles.mapsButton}
            >
              <Text style={styles.mapsButtonText}>
                ↗ Abrir en Google Maps
              </Text>
            </Pressable>
          <Text style={styles.label}>Teléfono</Text>
          <Text style={styles.value}>{pedido.telefono}</Text>

          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.value}>{pedido.descripcion}</Text>

          <Text style={styles.label}>
            Personas autorizadas
          </Text>
          <Text style={styles.value}>
            {pedido.autorizados.length > 0
              ? pedido.autorizados.join(', ')
              : 'No hay personas autorizadas adicionales registradas'}
          </Text>

                    
          {!bloqueRecibido ? (
            <View style={styles.receipt}>
              <Text style={styles.sectionTitle}>
                Recepción de este pedido
              </Text>

              <Text style={styles.label}>Bultos recibidos</Text>

              <TextInput
                value={cantidad}
                onChangeText={onChangeCantidad}
                keyboardType="number-pad"
                placeholder="Escribe la cantidad"
                placeholderTextColor="#818898"
                style={styles.input}
              />

              <Pressable
                onPress={onTomarFoto}
                style={styles.photoButton}
              >
                <Text style={styles.photoButtonText}>
                  {fotoCapturada
                    ? '✓ Fotografía registrada · Tomar otra'
                    : '▣ Tomar fotografía'}
                </Text>
              </Pressable>

              <Text style={styles.hint}>
                La fotografía se guarda sin mostrar una vista previa.
              </Text>
            </View>
          ) : reporteEntrega ? (
            <View style={styles.receipt}>
              <Text style={styles.sectionTitle}>
                ✓ Reporte registrado
              </Text>

              <Text style={styles.value}>
                Estado: {reporteEntrega.estado}
              </Text>

              <Text style={styles.value}>
                Bultos entregados: {reporteEntrega.cantidad}
              </Text>

              <Text style={styles.value}>
                Fotografía: registrada
              </Text>

              <Text style={styles.label}>Comentarios</Text>
              <Text style={styles.value}>
                {reporteEntrega.comentarios || 'Sin comentarios'}
              </Text>
            </View>
          ) : gestionandoEntrega ? (
            <PedidoEntregaForm
              pedidoId={pedido.id}
              cantidadRecibida={cantidadRecibida}
              onCancelar={() => setGestionandoEntrega(false)}
              onConfirmar={(reporte) => {
                setReporteEntrega(reporte);
                setGestionandoEntrega(false);
              }}
            />
          ) : (
            <Pressable
              onPress={() => setGestionandoEntrega(true)}
              style={styles.deliveryButton}
            >
              <Text style={styles.deliveryButtonText}>
                Gestionar entrega
              </Text>
            </Pressable>
          )}

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  mapsButton: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 3,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#E7EEFF',
  },
  mapsButtonText: {
    color: '#2458A6',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E5ED',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    minHeight: 76,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  id: {
    color: '#2458A6',
    fontSize: 13,
    fontWeight: '800',
  },
  cliente: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: '#657084',
    fontSize: 12,
  },
  chevron: {
    color: '#657084',
    fontSize: 25,
    paddingHorizontal: 5,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#E0E5ED',
    padding: 14,
    gap: 6,
  },
  label: {
    color: '#657084',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  value: {
    color: '#172033',
    fontSize: 14,
    lineHeight: 20,
  },
  receipt: {
    borderTopWidth: 1,
    borderTopColor: '#E0E5ED',
    marginTop: 12,
    paddingTop: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CDD4DF',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#172033',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  photoButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#E7EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  photoButtonText: {
    color: '#244DA8',
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: '#657084',
    fontSize: 11,
    lineHeight: 16,
  },
  deliveryButton: {
    marginTop: 12,
    backgroundColor: '#16834A',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  deliveryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
