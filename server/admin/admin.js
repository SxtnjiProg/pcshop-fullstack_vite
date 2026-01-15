import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource } from '@adminjs/prisma'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import session from 'express-session'

const prisma = new PrismaClient()

AdminJS.registerAdapter({ Database, Resource })

const ADMIN = {
  email: 'admin@admin.com',
  password: bcrypt.hashSync('admin123', 10),
}

const authenticate = async (email, password) => {
  if (email === ADMIN.email) {
    const valid = await bcrypt.compare(password, ADMIN.password)
    if (valid) return ADMIN
  }
  return null
}

const admin = new AdminJS({
  rootPath: '/admin',
  databases: [{ client: prisma }],
  branding: {
    companyName: 'PC Shop Admin',
  },
})

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'super-secret',
  },
  null,
  {
    secret: 'super-secret',
    resave: false,
    saveUninitialized: true,
  }
)

export { admin, adminRouter }
