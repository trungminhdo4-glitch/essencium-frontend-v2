import {
  RiDashboardLine,
  RiGroupLine,
  RiKeyLine,
  RiShieldCheckLine,
  RiShieldKeyholeLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import type { LinkProps } from '@tanstack/react-router'
import type { ParseKeys } from 'i18next'

import { RIGHTS, type Right } from '@/lib/permissions'

export interface NavItem {
  /** i18n key for the label, e.g. `navigation.users`. */
  labelKey: ParseKeys
  to: LinkProps['to']
  icon: RemixiconComponentType
  /** Right(s) required to see this item — array means "any of". Omit = always. */
  rights?: Right | readonly Right[]
  /** Require *every* entry in `rights` instead of any of them. */
  requiresAll?: boolean
}

/** Primary sidebar navigation. Order is the display order. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    labelKey: 'navigation.dashboard',
    to: '/',
    icon: RiDashboardLine,
  },
  {
    labelKey: 'navigation.users',
    to: '/users',
    icon: RiGroupLine,
    rights: RIGHTS.USER_READ,
  },
  {
    labelKey: 'navigation.roles',
    to: '/roles',
    icon: RiShieldCheckLine,
    rights: [RIGHTS.ROLE_READ, RIGHTS.RIGHT_READ],
  },
  {
    labelKey: 'navigation.rights',
    to: '/rights',
    icon: RiShieldKeyholeLine,
    rights: [RIGHTS.ROLE_UPDATE, RIGHTS.RIGHT_READ],
    requiresAll: true,
  },
  {
    labelKey: 'navigation.apiTokens',
    to: '/api-tokens',
    icon: RiKeyLine,
    rights: RIGHTS.API_TOKEN,
  },
]
