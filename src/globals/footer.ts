import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { navItemsField } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Site' },
  access: { read: anyone, update: isStaff },
  fields: [navItemsField, { name: 'copyright', type: 'text', localized: true }],
}
