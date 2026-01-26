'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import KioscoModal from '@/components/KioscoModal'

export function GlobalModals() {
       const searchParams = useSearchParams()
       const router = useRouter()
       const pathname = usePathname()
       const [isKioscoOpen, setIsKioscoOpen] = useState(false)

       useEffect(() => {
              const modal = searchParams.get('modal')
              if (modal === 'kiosco') {
                     setIsKioscoOpen(true)
              } else {
                     setIsKioscoOpen(false)
              }
       }, [searchParams])

       const handleClose = () => {
              setIsKioscoOpen(false)
              // Remove modal param from URL without refreshing or navigating away
              const params = new URLSearchParams(searchParams.toString())
              params.delete('modal')
              router.push(`${pathname}?${params.toString()}`)
       }

       return (
              <KioscoModal
                     isOpen={isKioscoOpen}
                     onClose={handleClose}
              />
       )
}
