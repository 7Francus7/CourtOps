'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export const SectionTransition = ({ children }: { children: React.ReactNode }) => {
       const pathname = usePathname()

       return (
              <motion.div
                     key={pathname}
                     initial={{ opacity: 0, scale: 0.99, filter: "blur(10px)" }}
                     animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                     transition={{
                            duration: 0.55,
                            ease: [0.16, 1, 0.3, 1] // Out Expo
                     }}
                     className="flex-1 flex flex-col min-h-0"
              >
                     {children}
              </motion.div>
       )
}
