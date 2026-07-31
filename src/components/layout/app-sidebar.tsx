import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { NavUser } from '@/components/layout/nav-user'
import { useNavItems, type NavNode } from '@/components/layout/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { usePermissions } from '@/hooks/use-permissions'

function isItemActive(pathname: string, to: string): boolean {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

function visibleSidebarNodes(
  nodes: NavNode[],
  can: (rights: NavNode['rights']) => boolean,
): NavNode[] {
  return nodes
    .map(node => ({
      ...node,
      children: visibleSidebarNodes(node.children, can),
    }))
    .filter(node => {
      if (!node.inSidebar || !can(node.rights)) return false
      return node.navigable || node.children.length > 0
    })
}

export function AppSidebar(): React.ReactElement {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const pathname = useRouterState({ select: s => s.location.pathname })

  const items = visibleSidebarNodes(useNavItems(), can)

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
          {items.map(item => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                isActive={
                  item.navigable && isItemActive(pathname, item.to ?? '/')
                }
                tooltip={item.label}
                {...(item.navigable ? { render: <Link to={item.to} /> } : {})}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
              {item.children.length > 0 && (
                <SidebarMenuSub>
                  {item.children.map(child => (
                    <SidebarMenuSubItem key={child.to}>
                      <SidebarMenuSubButton
                        isActive={isItemActive(pathname, child.to ?? '/')}
                        render={<Link to={child.to} />}
                      >
                        <child.icon />
                        <span>{child.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
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
