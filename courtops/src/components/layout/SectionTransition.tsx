'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export const SectionTransition = ({ children }: { children: React.ReactNode }) => {
       const pathname = usePathname()

       return (
              <motion.div
                     key={pathname}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1] // Custom ease out quint
                     }}
                     className="flex-1 flex flex-col min-h-0"
              >
                     {children}
              </motion.div>
       )
}
