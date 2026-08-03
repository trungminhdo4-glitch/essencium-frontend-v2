import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { NavUser } from '@/components/layout/nav-user'
import { NAV_ITEMS } from '@/components/layout/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePermissions } from '@/hooks/use-permissions'

function isItemActive(pathname: string, to: string): boolean {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

/** Primary application sidebar: logo, permission-gated navigation, user menu. */
export function AppSidebar(): React.ReactElement {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const pathname = useRouterState({ select: s => s.location.pathname })

  const visibleItems = NAV_ITEMS.filter(item => {
    const { rights, requiresAll } = item
    if (requiresAll && typeof rights !== 'string' && rights !== undefined) {
      return rights.every(right => can(right))
    }
    return can(rights)
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <img
            src="/img/emblem.svg"
            alt=""
            className="size-7 shrink-0"
            aria-hidden
          />
          <span className="truncate text-lg font-semibold group-data-[collapsible=icon]:hidden">
            {t('common.appName')}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>{t('navigation.menu')}</SidebarGroupLabel>
        <SidebarMenu>
          {visibleItems.map(item => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                isActive={isItemActive(pathname, item.to ?? '/')}
                tooltip={t(item.labelKey)}
                render={<Link to={item.to} />}
              >
                <item.icon />
                <span>{t(item.labelKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
