import { Store, LayoutGrid, ShoppingCart, Banknote, Flag } from 'lucide-react'
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
      icon: Store,
      title: 'Módulo de Kiosco (POS)',
      description:
        'Tu punto de venta integrado. Vendé bebidas, accesorios y servicios extra. Todo queda en la caja del día automáticamente, sin doble carga.',
      position: 'center',
    },
    {
      id: 'nav-kiosco',
      target: '[data-tour="nav-kiosco"]',
      category: 'Acceso',
      icon: Store,
      title: 'Cómo abrir el Kiosco',
      description:
        'Abrí el kiosco desde el menú lateral o con la tecla "K". También podés abrirlo directamente desde una reserva para agregarle productos al turno.',
      proTip: 'El atajo de teclado "K" abre el kiosco desde cualquier pantalla. Ideal para atender rápido sin perder de vista la grilla de canchas.',
      position: 'right',
      padding: 6,
      borderRadius: 12,
      waitForElement: true,
    },
    {
      id: 'kiosco-products',
      target: '[data-tour="kiosco-products"]',
      category: 'Catálogo',
      icon: LayoutGrid,
      title: 'Grilla de productos',
      description:
        'Seleccioná los productos tocando cada ítem. El precio se suma automáticamente al carrito. Configurá tu catálogo desde Configuración → Productos.',
      proTip: 'Podés asignar fotos a cada producto para que el staff los identifique más rápido. Muy útil en horas pico.',
      position: 'top',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
    },
    {
      id: 'kiosco-cart',
      target: '[data-tour="kiosco-cart"]',
      category: 'Cobro',
      icon: ShoppingCart,
      title: 'Carrito y métodos de pago',
      description:
        'El sistema calcula el total y el vuelto automáticamente. Podés dividir el pago entre jugadores, cobrar en efectivo y transferencia simultáneamente, o dejar deuda.',
      proTip: 'Usa "Dividir entre jugadores" para que cada uno pague su parte. El sistema calcula las partes proporcionales al instante.',
      position: 'left',
      padding: 8,
      borderRadius: 16,
      waitForElement: true,
    },
    {
      id: 'kiosco-fin',
      target: null,
      icon: Flag,
      title: '¡Módulo de Kiosco dominado!',
      description:
        'Ya sabés vender con el POS integrado. Todas las ventas suman automáticamente a tu caja diaria. El cierre de caja te da el resumen completo del día.',
      position: 'center',
    },
  ],
}
