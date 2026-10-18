import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { navItemsField } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Site' },
  access: { read: anyone, update: isStaff },
  fields: [navItemsField],
}
