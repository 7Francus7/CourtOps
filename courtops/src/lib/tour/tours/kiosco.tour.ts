import type { TourDefinition } from '../types'

export const kioscoTour: TourDefinition = {
  id: 'kiosco',
  title: 'Tour de Kiosco',
  description: 'Tu punto de venta integrado con la caja diaria',
  localStorageKey: 'courtops_tour_kiosco_v1',
  steps: [
    {
      id: 'kiosco-intro',
      target: null,
      title: 'Módulo de Kiosco (POS)',
      description:
        'El kiosco es tu punto de venta para bebidas, accesorios y servicios adicionales. Todo queda registrado en la caja del día.',
      position: 'center',
    },
    {
      id: 'nav-kiosco',
      target: '[data-tour="nav-kiosco"]',
      title: 'Acceso al Kiosco',
      description:
        'Abrí el kiosco desde el menú lateral o usando la tecla "K". También podés abrirlo directamente desde una reserva.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'kiosco-products',
      target: '[data-tour="kiosco-products"]',
      title: 'Grilla de productos',
      description:
        'Seleccioná los productos que vendió el cliente. Podés configurar tu catálogo desde la sección de Configuración.',
      position: 'top',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
    },
    {
      id: 'kiosco-cart',
      target: '[data-tour="kiosco-cart"]',
      title: 'Carrito y cobro',
      description:
        'El sistema calcula el total automáticamente. Podés cobrar en efectivo, transferencia o dividir el pago entre jugadores.',
      position: 'left',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
    },
    {
      id: 'kiosco-fin',
      target: null,
      title: '¡Módulo de Kiosco dominado!',
      description:
        'Ya sabés cómo vender con el kiosco integrado. Todas las ventas quedan en tu caja diaria automáticamente.',
      position: 'center',
    },
  ],
}
