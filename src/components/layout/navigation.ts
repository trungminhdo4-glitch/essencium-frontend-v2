import {
  RiDashboardLine,
  RiFileList2Line,
  RiGroupLine,
  RiKeyLine,
  RiSettingsLine,
  RiShieldCheckLine,
  RiUserLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { useRouter, type LinkProps } from '@tanstack/react-router'
import type { ParseKeys, TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { RIGHTS, type Right } from '@/lib/permissions'

interface RouteMeta {
  labelKey?: ParseKeys
  icon?: RemixiconComponentType
  rights?: Right | readonly Right[]
  hidden?: boolean
  inSidebar?: boolean
  order?: number
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/': { labelKey: 'navigation.dashboard', icon: RiDashboardLine, order: 0 },
  '/users': {
    labelKey: 'navigation.users',
    icon: RiGroupLine,
    rights: RIGHTS.USER_READ,
    order: 10,
  },
  '/roles': {
    labelKey: 'navigation.roles',
    icon: RiShieldCheckLine,
    rights: [RIGHTS.ROLE_READ, RIGHTS.RIGHT_READ],
    order: 20,
  },
  '/api-tokens': {
    labelKey: 'navigation.apiTokens',
    icon: RiKeyLine,
    rights: RIGHTS.API_TOKEN,
    order: 30,
  },
  '/profile': {
    labelKey: 'navigation.profile',
    icon: RiUserLine,
    inSidebar: false,
    order: 40,
  },
  '/settings': {
    labelKey: 'navigation.settings',
    icon: RiSettingsLine,
    inSidebar: false,
    order: 50,
  },
  '/users/new': { hidden: true },
}

const DEFAULT_ICON: RemixiconComponentType = RiFileList2Line
const DEFAULT_ORDER = 1000

export function navRights(path: string): Right | readonly Right[] | undefined {
  return ROUTE_META[path]?.rights
}

function titleize(segment: string): string {
  return segment
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function resolveLabel(path: string, lastSegment: string, t: TFunction): string {
  const labelKey = ROUTE_META[path]?.labelKey
  return labelKey ? t(labelKey) : titleize(lastSegment)
}

function normalizePath(path: string): string {
  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
}

export interface NavNode {
  to: LinkProps['to']
  label: string
  icon: RemixiconComponentType
  rights?: Right | readonly Right[]
  inSidebar: boolean
  order: number
  navigable: boolean
  children: NavNode[]
  segments: string[]
}

export interface NavLeaf extends NavNode {
  breadcrumbLabel: string
}

interface ResolvedRoute {
  to: string
  segments: string[]
  label: string
  icon: RemixiconComponentType
  rights?: Right | readonly Right[]
  inSidebar: boolean
  order: number
}

interface NavRoute {
  id: string
  fullPath: string
}

export function useNavItems(): NavNode[] {
  const router = useRouter()
  const { t } = useTranslation()

  const routes = Object.values(router.routesById) as NavRoute[]

  const leaves: ResolvedRoute[] = routes
    .filter(route => {
      const { id, fullPath } = route
      if (!id.startsWith('/_authenticated')) return false
      if (id === '/_authenticated') return false
      if (!fullPath || fullPath.includes('$')) return false
      return ROUTE_META[normalizePath(fullPath)]?.hidden !== true
    })
    .map(route => {
      const to = normalizePath(route.fullPath)
      const segments = to === '/' ? [] : to.split('/').filter(Boolean)
      const lastSegment = segments[segments.length - 1] ?? ''
      const meta = ROUTE_META[to]
      return {
        to,
        segments,
        label: resolveLabel(to, lastSegment, t),
        icon: meta?.icon ?? DEFAULT_ICON,
        rights: meta?.rights,
        inSidebar: meta?.inSidebar ?? true,
        order: meta?.order ?? DEFAULT_ORDER,
      }
    })

  return buildTree(leaves, t)
}

function buildTree(leaves: ResolvedRoute[], t: TFunction): NavNode[] {
  const byPath = new Map<string, NavNode>()

  const ensure = (path: string, segments: string[]): NavNode => {
    let node = byPath.get(path)
    if (!node) {
      const lastSegment = segments[segments.length - 1] ?? ''
      node = {
        to: path as LinkProps['to'],
        label: resolveLabel(path, lastSegment, t),
        icon: ROUTE_META[path]?.icon ?? DEFAULT_ICON,
        inSidebar: true,
        order: ROUTE_META[path]?.order ?? DEFAULT_ORDER,
        navigable: false,
        children: [],
        segments,
      }
      byPath.set(path, node)
    }
    return node
  }

  for (const leaf of leaves) {
    for (let depth = 1; depth <= leaf.segments.length; depth++) {
      const path = '/' + leaf.segments.slice(0, depth).join('/')
      ensure(path, leaf.segments.slice(0, depth))
    }
    if (leaf.segments.length === 0) ensure('/', [])
  }

  for (const leaf of leaves) {
    const node = ensure(leaf.to, leaf.segments)
    node.label = leaf.label
    node.icon = leaf.icon
    node.rights = leaf.rights
    node.inSidebar = leaf.inSidebar
    node.order = leaf.order
    node.navigable = true
  }

  const roots: NavNode[] = []
  for (const node of byPath.values()) {
    if (node.segments.length <= 1) {
      roots.push(node)
    } else {
      const parentPath = '/' + node.segments.slice(0, -1).join('/')
      ensure(parentPath, node.segments.slice(0, -1)).children.push(node)
    }
  }

  const byOrderThenLabel = (a: NavNode, b: NavNode): number =>
    a.order - b.order || a.label.localeCompare(b.label)
  const sortRecursive = (nodes: NavNode[]): void => {
    nodes.sort(byOrderThenLabel)
    nodes.forEach(node => sortRecursive(node.children))
  }
  sortRecursive(roots)

  return roots
}

export function flattenNavItems(nodes: NavNode[]): NavLeaf[] {
  const result: NavLeaf[] = []
  const walk = (node: NavNode, ancestorLabels: string[]): void => {
    const trail = [...ancestorLabels, node.label]
    if (node.navigable) {
      result.push({ ...node, breadcrumbLabel: trail.join(' › ') })
    }
    node.children.forEach(child => walk(child, trail))
  }
  nodes.forEach(node => walk(node, []))
  return result
}
