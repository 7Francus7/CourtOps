import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
       const email = 'dellorsif@gmail.com'
       const password = '123456franco'

       console.log('🔍 Probando autenticación para:', email)
       console.log('🔑 Contraseña:', password)
       console.log('')

       const user = await prisma.user.findUnique({
              where: { email }
       })

       if (!user) {
              console.log('❌ Usuario NO encontrado en la base de datos')
              return
       }

       console.log('✅ Usuario encontrado')
       console.log('   Nombre:', user.name)
       console.log('   Rol:', user.role)
       console.log('')

        if (!user.password) {
               console.log('❌ El usuario no tiene contraseña en la base de datos')
               return
        }

        const isValid = await compare(password, user.password)

       if (isValid) {
              console.log('✅ ¡CONTRASEÑA CORRECTA!')
              console.log('   La autenticación debería funcionar')
       } else {
              console.log('❌ CONTRASEÑA INCORRECTA')
              console.log('   El hash en la BD no coincide con la contraseña proporcionada')
              console.log('')
              console.log('💡 Solución: Necesitas resetear la contraseña en la base de datos')
       }
}

main()
       .catch(console.error)
       .finally(() => prisma.$disconnect())
