'use client'

import React from 'react'
import DesktopKiosco from './DesktopKiosco'
import MobileKiosco from './MobileKiosco'

type Props = {
       isOpen: boolean
       onClose: () => void
}

export default function KioscoModal({ isOpen, onClose }: Props) {
       if (!isOpen) return null

       return (
              <>
                     <div className="lg:hidden">
                            <MobileKiosco isOpen={isOpen} onClose={onClose} />
                     </div>
                     <div className="hidden lg:block">
                            <DesktopKiosco isOpen={isOpen} onClose={onClose} />
                     </div>
              </>
       )
}
