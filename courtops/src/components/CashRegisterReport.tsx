
'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function CashRegisterReport({ data }: { data: any }) {

       return (
              <div className="bg-white p-8 max-w-2xl mx-auto border border-black font-mono text-sm print:border-0 print:p-0">
                     <div className="text-center mb-6">
                            <h1 className="text-xl font-bold uppercase">Reporte de Cierre de Caja</h1>
                            <p>{format(new Date(), "PPpp", { locale: es })}</p>
                     </div>

                     <div className="border-b-2 border-dashed border-black my-4" />

                     <div className="space-y-2">
                            <div className="flex justify-between font-bold">
                                   <span>Apertura:</span>
                                   <span>${data.startAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                   <span>Ingresos Efectivo:</span>
                                   <span>+${data.incomeCash}</span>
                            </div>
                            <div className="flex justify-between">
                                   <span>Ingresos Digitales:</span>
                                   <span>+${data.incomeTransfer}</span>
                            </div>
                            <div className="flex justify-between">
                                   <span>Retiros/Gastos:</span>
                                   <span>-${data.expenseCash}</span>
                            </div>
                     </div>

                     <div className="border-b-2 border-dashed border-black my-4" />

                     <div className="flex justify-between text-lg font-bold">
                            <span>Total Esperado (Efvo):</span>
                            <span>${data.currentCash}</span>
                     </div>

                     <div className="flex justify-between text-lg font-bold mt-2">
                            <span>Total Declarado:</span>
                            <span>${data.declaredCash}</span>
                     </div>

                     <div className="mt-8 pt-8 border-t border-black flex justify-between">
                            <div className="w-1/2 text-center">
                                   <div className="h-16 border-b border-black w-3/4 mx-auto mb-2" />
                                   <p>Firma Encargado</p>
                            </div>
                            <div className="w-1/2 text-center">
                                   <div className="h-16 border-b border-black w-3/4 mx-auto mb-2" />
                                   <p>Firma Administración</p>
                            </div>
                     </div>
              </div>
       )
}
