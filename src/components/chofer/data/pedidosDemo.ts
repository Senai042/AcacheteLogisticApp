
export type PedidoDemo = {
  id: string;
  cliente: string;
  direccion: string;
  telefono: string;
  autorizados: string[];
  descripcion: string;
};

export const PEDIDOS_DEMO: PedidoDemo[] = [
  {
    id: '2354654',
    cliente: 'María Rodríguez',
    direccion: 'Ciudad Quesada, San Carlos',
    telefono: '8888-0001',
    autorizados: ['Carlos Rodríguez'],
    descripcion: 'Paquete general',
  },
  {
    id: '1214345',
    cliente: 'Carlos Vargas',
    direccion: 'Florencia, San Carlos',
    telefono: '8888-0002',
    autorizados: [],
    descripcion: 'Caja mediana',
  },
  {
    id: '5467657',
    cliente: 'Ana González',
    direccion: 'Aguas Zarcas, San Carlos',
    telefono: '8888-0003',
    autorizados: ['Laura González'],
    descripcion: 'Paquete pequeño',
  },
];
