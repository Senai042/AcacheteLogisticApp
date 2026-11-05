
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('acachete.db');

export type PedidoLocal = {
  id: string;
  cliente: string;
  direccion: string;
  telefono: string;
  autorizados: string[];
  descripcion: string;
  cantidad_recibida?: number | null;
  fotografia_recepcion_uri?: string | null;
  estado?: string;
};

export type ReporteEntregaLocal = {
  id: string;
  pedido_id: string;
  cantidad_entregada: number;
  fotografia_uri: string;
  comentarios: string;
  estado: 'Entregado' | 'Entrega parcial';
};

function fechaActual() {
  return new Date().toISOString();
}

export async function inicializarBaseDatos() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS pedidos (
      id TEXT PRIMARY KEY NOT NULL,
      cliente TEXT NOT NULL,
      direccion TEXT NOT NULL,
      telefono TEXT NOT NULL,
      autorizados_json TEXT NOT NULL DEFAULT '[]',
      descripcion TEXT NOT NULL DEFAULT '',
      cantidad_recibida INTEGER,
      fotografia_recepcion_uri TEXT,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      actualizado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reportes_entrega (
      id TEXT PRIMARY KEY NOT NULL,
      pedido_id TEXT NOT NULL,
      cantidad_entregada INTEGER NOT NULL,
      fotografia_uri TEXT NOT NULL,
      comentarios TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL,
      creado_en TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    );

    CREATE TABLE IF NOT EXISTS cola_sincronizacion (
      id TEXT PRIMARY KEY NOT NULL,
      tipo TEXT NOT NULL,
      entidad_id TEXT NOT NULL,
      datos_json TEXT NOT NULL,
      creado_en TEXT NOT NULL,
      intentos INTEGER NOT NULL DEFAULT 0,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function guardarPedido(pedido: PedidoLocal) {
  await db.runAsync(
    `INSERT INTO pedidos (
      id, cliente, direccion, telefono,
      autorizados_json, descripcion,
      cantidad_recibida, fotografia_recepcion_uri,
      estado, actualizado_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      cliente = excluded.cliente,
      direccion = excluded.direccion,
      telefono = excluded.telefono,
      autorizados_json = excluded.autorizados_json,
      descripcion = excluded.descripcion,
      actualizado_en = excluded.actualizado_en`,
    pedido.id,
    pedido.cliente,
    pedido.direccion,
    pedido.telefono,
    JSON.stringify(pedido.autorizados),
    pedido.descripcion,
    pedido.cantidad_recibida ?? null,
    pedido.fotografia_recepcion_uri ?? null,
    pedido.estado ?? 'pendiente',
    fechaActual()
  );
}

export async function obtenerPedidos(): Promise<PedidoLocal[]> {
  const filas = await db.getAllAsync<{
    id: string;
    cliente: string;
    direccion: string;
    telefono: string;
    autorizados_json: string;
    descripcion: string;
    cantidad_recibida: number | null;
    fotografia_recepcion_uri: string | null;
    estado: string;
  }>(
    `SELECT * FROM pedidos ORDER BY actualizado_en DESC`
  );

  return filas.map((fila) => ({
    id: fila.id,
    cliente: fila.cliente,
    direccion: fila.direccion,
    telefono: fila.telefono,
    autorizados: JSON.parse(fila.autorizados_json),
    descripcion: fila.descripcion,
    cantidad_recibida: fila.cantidad_recibida,
    fotografia_recepcion_uri: fila.fotografia_recepcion_uri,
    estado: fila.estado,
  }));
}

export async function guardarReporteEntrega(
  reporte: ReporteEntregaLocal
) {
  const creadoEn = fechaActual();
  const datosJson = JSON.stringify({
    ...reporte,
    creado_en: creadoEn,
  });                                                                 

  await db.withTransactionAsync(async () => {
    const pedido = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM pedidos WHERE id = ?',
      reporte.pedido_id
    );

    if (!pedido) {
      throw new Error(
        `No existe el pedido ${reporte.pedido_id} en la base local.`
      );
    }

    await db.runAsync(
      `INSERT INTO reportes_entrega (
        id, pedido_id, cantidad_entregada,
        fotografia_uri, comentarios, estado,
        creado_en, sincronizado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      reporte.id,
      reporte.pedido_id,
      reporte.cantidad_entregada,
      reporte.fotografia_uri,
      reporte.comentarios,
      reporte.estado,
      creadoEn
    );

    await db.runAsync(
      `UPDATE pedidos
       SET estado = ?, actualizado_en = ?
       WHERE id = ?`,
      reporte.estado,
      creadoEn,
      reporte.pedido_id
    );

    await db.runAsync(
      `INSERT INTO cola_sincronizacion (
        id, tipo, entidad_id, datos_json, creado_en
      ) VALUES (?, ?, ?, ?, ?)`,
      `reporte:${reporte.id}`,
      'reporte_entrega',
      reporte.id,
      datosJson,
      creadoEn
    );
  });
}

export async function obtenerPendientesSincronizacion() {
  return db.getAllAsync<{
    id: string;
    tipo: string;
    entidad_id: string;
    datos_json: string;
    creado_en: string;
    intentos: number;
  }>(
    `SELECT id, tipo, entidad_id, datos_json, creado_en, intentos
     FROM cola_sincronizacion
     WHERE sincronizado = 0
     ORDER BY creado_en ASC`
  );
}


export async function guardarRecepcionPedido(
  pedidoId: string,
  cantidad: number,
  fotografiaUri: string
) {
  const creadoEn = new Date().toISOString();

  const datos = {
    pedido_id: pedidoId,
    cantidad_recibida: cantidad,
    fotografia_recepcion_uri: fotografiaUri,
    estado: 'recepcion_completada',
    creado_en: creadoEn,
  };

  await db.withTransactionAsync(async () => {
    const resultado = await db.runAsync(
      `UPDATE pedidos
       SET cantidad_recibida = ?,
           fotografia_recepcion_uri = ?,
           estado = ?,
           actualizado_en = ?
       WHERE id = ?`,
      cantidad,
      fotografiaUri,
      datos.estado,
      creadoEn,
      pedidoId
    );

    if (resultado.changes === 0) {
      throw new Error(
        `No se encontró el pedido ${pedidoId} en SQLite.`
      );
    }

    await db.runAsync(
      `INSERT INTO cola_sincronizacion (
        id, tipo, entidad_id, datos_json,
        creado_en, intentos, sincronizado
      ) VALUES (?, ?, ?, ?, ?, 0, 0)`,
      `recepcion:${pedidoId}:${Date.now()}`,
      'recepcion_pedido',
      pedidoId,
      JSON.stringify(datos),
      creadoEn
    );
  });
}

export async function exportarDatosJSON() {
  const pedidos = await db.getAllAsync(
    'SELECT * FROM pedidos ORDER BY actualizado_en DESC'
  );

  const reportes = await db.getAllAsync(
    'SELECT * FROM reportes_entrega ORDER BY creado_en DESC'
  );

  const pendientes = await db.getAllAsync(
    `SELECT * FROM cola_sincronizacion
     ORDER BY creado_en ASC`
  );

  const exportacion = {
    aplicacion: 'Acachete Encomiendas',
    version_formato: 1,
    fecha_exportacion: new Date().toISOString(),
    datos: {
      pedidos,
      reportes_entrega: reportes,
      cola_sincronizacion: pendientes,
    },
  };

  return JSON.stringify(exportacion, null, 2);
}

export default db;
