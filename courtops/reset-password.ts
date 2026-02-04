import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
       const email = 'dellorsif@gmail.com'
       const newPassword = '123456franco'

       console.log('🔄 Actualizando contraseña para:', email)
       console.log('🔑 Nueva contraseña:', newPassword)
       console.log('')

       // Hash the new password
       const hashedPassword = await hash(newPassword, 12)

       // Update the user
       const user = await prisma.user.update({
              where: { email },
              data: { password: hashedPassword }
       })

       console.log('✅ Contraseña actualizada exitosamente')
       console.log('   Usuario:', user.email)
       console.log('   Nombre:', user.name)
       console.log('   Rol:', user.role)
       console.log('')
       console.log('💡 Ahora puedes iniciar sesión con:')
       console.log('   Email:', email)
       console.log('   Password:', newPassword)
}

main()
       .catch((error) => {
              console.error('❌ Error:', error.message)
       })
       .finally(() => prisma.$disconnect())
