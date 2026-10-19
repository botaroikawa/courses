import type { Access, FieldAccess } from 'payload'

// Only `admins` authenticate against Payload, so `req.user` is always an admin or null.

export const anyone: Access = () => true

export const isStaff: Access = ({ req }) => Boolean(req.user)

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'

export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  return { id: { equals: req.user.id } }
}

// Staff see drafts, everyone else only what is published in the requested locale
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

// Staff see every file, everyone else only those marked public. Also guards the file endpoint.
export const publicOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { visibility: { equals: 'public' } }
}

export const never: FieldAccess = () => false
